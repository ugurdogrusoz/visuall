import { Component, OnInit, ViewChild } from '@angular/core';
import properties from '../../../assets/generated/properties.json';
import { compareUsingOperator, FILTER_CLASS_HIDE, GENERIC_TYPE, deepCopy } from '../../constants';
import * as $ from 'jquery';
import { DbAdapterService } from '../../db-service/db-adapter.service';
import { CytoscapeService } from '../../cytoscape.service';
import { GlobalVariableService } from '../../global-variable.service';
import { TimebarService } from '../../timebar.service';
import { ClassOption, ClassBasedRules, Rule, RuleSync, getBoolExpressionFromMetric, FilteringRule } from './filtering-types';
import { Subject } from 'rxjs';
import AppDescription from '../../../assets/app_description.json';
import { TableViewInput, TableData, TableDataType, TableFiltering, TableRowMeta } from 'src/app/table-view/table-view-types';
import { DbQueryType, GraphResponse } from 'src/app/db-service/data-types';
import { GroupTabComponent } from './group-tab/group-tab.component';
import { MergedElemIndicatorTypes } from 'src/app/user-preference.js';
import { UserProfileService } from 'src/app/user-profile.service';

@Component({
  selector: 'app-map-tab',
  templateUrl: './map-tab.component.html',
  styleUrls: ['./map-tab.component.css']
})
export class MapTabComponent implements OnInit {

  nodeClasses: Set<string>;
  edgeClasses: Set<string>;
  classOptions: ClassOption[];
  selectedClassProps: string[];
  selectedClass: string;
  attributeType: string;
  isDateProp: boolean;
  currDatetimes: Date[];
  filteringRule: ClassBasedRules;
  isFilterOnDb: boolean;
  currProperties: Subject<RuleSync> = new Subject();
  tableInput: TableViewInput = { columns: [], results: [], resultCnt: 0, currPage: 1, pageSize: 0, isLoadGraph: true, isMergeGraph: true, isNodeData: true };
  tableFilled = new Subject<boolean>();
  isClassTypeLocked: boolean;
  private isGroupTabOpen = false;
  @ViewChild(GroupTabComponent, { static: false })
  private groupComponent: GroupTabComponent;
  currRules: FilteringRule[] = [];
  isAddingNewRule = false;
  changeBtnTxt = 'Update';
  currRuleName = 'New rule';

  constructor(private _cyService: CytoscapeService, private _g: GlobalVariableService, private _dbService: DbAdapterService,
    private _timebarService: TimebarService, private _profile: UserProfileService) {
    this.isFilterOnDb = true;
    this.tableInput.isMergeGraph = true;
    this.nodeClasses = new Set([]);
    this.edgeClasses = new Set([]);
    this.classOptions = [];
    this.selectedClassProps = [];
    this.isDateProp = false;
    this.currDatetimes = [new Date()];
    this._profile.onLoadFromFile.subscribe(x => {
      if (!x) {
        return;
      }
      if (this._profile.isStoreProfile()) {
        this.currRules = this._profile.getFilteringRules();
      }
    });
  }

  ngOnInit() {
    this._g.userPrefs.dataPageSize.subscribe(x => { this.tableInput.pageSize = x; });

    for (const key in properties.nodes) {
      this.classOptions.push({ text: key, isDisabled: false });
      this.nodeClasses.add(key);
      if (this.selectedClassProps.length == 0) {
        this.selectedClassProps = Object.keys(properties.nodes[key]);
      }
    }

    for (const key in properties.edges) {
      this.edgeClasses.add(key);
      this.classOptions.push({ text: key, isDisabled: false });
    }

    if (this._profile.isStoreProfile()) {
      this.currRules = this._profile.getFilteringRules();
    }
    let i = this.getEditingRuleIdx();
    if (i > -1) {
      this.currRules[i].isEditing = false; // simulate click
      this.editRule(i);
    } else {
      this.newRuleClick();
    }
  }

  ruleOperatorClicked(j: number, op: string) {
    if (op == 'OR') {
      this.filteringRule.rules[j].ruleOperator = 'AND';
    } else {
      this.filteringRule.rules[j].ruleOperator = 'OR';
    }
  }

  changeSelectedClass() {
    const txt = this.selectedClass;
    let isNodeClassSelected: boolean = properties.nodes.hasOwnProperty(txt);
    let isEdgeClassSelected: boolean = properties.edges.hasOwnProperty(txt);
    this.selectedClassProps.length = 0;
    this.selectedClassProps.push(GENERIC_TYPE.NOT_SELECTED);
    let isGeneric = false;
    if (isNodeClassSelected) {
      this.selectedClassProps.push(...Object.keys(properties.nodes[txt]));
      this.selectedClassProps.push(...this.getEdgeTypesRelated(txt));
      isGeneric = false;
    } else if (isEdgeClassSelected) {
      this.selectedClassProps.push(...Object.keys(properties.edges[txt]));
      isGeneric = false;
    } else {
      isGeneric = true;
    }
    // update properties component on the call stack later
    setTimeout(() => {
      this.currProperties.next({ properties: this.selectedClassProps, isGenericTypeSelected: isGeneric, selectedClass: this.selectedClass });
    }, 0);
  }

  private getEdgeTypesRelated(nodeType: string): string[] {
    let r: string[] = [];

    const txt = this.selectedClass.toLowerCase();
    for (let k of Object.keys(AppDescription.relations)) {
      const v = AppDescription.relations[k];
      if (v.source.toLowerCase() == txt || v.target.toLowerCase() == txt) {
        r.push(k);
      }
    }
    return r;
  }

  addRule2FilteringRules(r: Rule) {
    const isEdge = this.edgeClasses.has(this.selectedClass);

    if (r.propertyType == 'datetime') {
      r.inputOperand = new Date(r.rawInput).toLocaleString();
    }
    if (!this.filteringRule) {
      this.filteringRule = { className: this.selectedClass, rules: [r], isEdge: isEdge };
    } else {
      this.filteringRule.rules.push(r);
    }
    this.isClassTypeLocked = true;
  }

  deleteFilterRule(j: number) {
    if (this.filteringRule.rules.length == 1) {
      this.filteringRule = null;
      this.isClassTypeLocked = false;
    } else {
      this.filteringRule.rules.splice(j, 1);
    }
  }

  changeFilterRuleOrder(j: number, isUp: boolean) {
    if ((isUp && j == 0) || (!isUp && j == this.filteringRule.rules.length - 1)) {
      return;
    }
    let idx = j + 1;
    if (isUp) {
      idx = j - 1;
    }
    let tmp = this.filteringRule.rules[j];
    this.filteringRule.rules[j] = this.filteringRule.rules[idx];
    this.filteringRule.rules[idx] = tmp;
  }

  filterByRule(rule: Rule, ele) {
    const attr = rule.propertyOperand;
    const op = rule.operator;
    const ruleVal = rule.inputOperand;
    const eleVal = ele.data(attr);
    if (rule.propertyType === 'string' && this._g.userPrefs.isIgnoreCaseInText.getValue()) {
      return compareUsingOperator(eleVal.toLowerCase(), ruleVal.toLowerCase(), op);
    }
    if (rule.propertyType == 'datetime') {
      return compareUsingOperator(eleVal, rule.rawInput, op);
    }
    return compareUsingOperator(eleVal, ruleVal, op);
  }

  runFilteringOnClient(cb: (s: number, end: number) => void, cbParams: any[]) {
    let fnStr = getBoolExpressionFromMetric(this.filteringRule) + ' return true; return false;';
    let filteredClassElems = this._g.cy.filter(new Function('x', fnStr));
    filteredClassElems.merge(filteredClassElems.connectedNodes());
    if (this._g.userPrefs.mergedElemIndicator.getValue() == MergedElemIndicatorTypes.highlight) {
      this._g.highlightElems(filteredClassElems);
    } else {
      filteredClassElems.select();
    }
    this._g.applyClassFiltering();
    this._g.performLayout(false);
    cb.apply(this, cbParams);
  }

  runFilteringOnDatabase(cb: (s: number, end: number) => void, cbParams: any[]) {
    if ($.isEmptyObject(this.filteringRule)) {
      console.log('there is no filteringRule');
      return;
    }
    const skip = (this.tableInput.currPage - 1) * this.tableInput.pageSize;
    const limit = this.tableInput.pageSize;
    const isMerge = this.tableInput.isMergeGraph && this._g.cy.elements().length > 0;

    this.getCountOfData();
    this.loadGraph(skip, limit, isMerge, cb, cbParams);
    this.loadTable(skip, limit);
  }

  private loadGraph(skip: number, limit: number, isMerge: boolean, cb: (s: number, end: number) => void, cbParams: any[]) {
    if (!this.tableInput.isLoadGraph) {
      return;
    }
    this._dbService.getFilteringResult(this.filteringRule, skip, limit, DbQueryType.std,
      (x) => { this._cyService.loadElementsFromDatabase(x as GraphResponse, isMerge); cb.apply(this, cbParams); });

  }

  private loadTable(skip: number, limit: number) {
    this._dbService.getFilteringResult(this.filteringRule, skip, limit, DbQueryType.table, (x) => { this.fillTable(x) });
  }

  private getCountOfData(filter: TableFiltering = null) {
    if (filter != null) {
      this._dbService.filterTable(this.filteringRule, filter, 0, -1, DbQueryType.count, (x) => { this.tableInput.resultCnt = x['data'][0]; });
    } else {
      this._dbService.getFilteringResult(this.filteringRule, 0, -1, DbQueryType.count, (x) => { this.tableInput.resultCnt = x['data'][0]; });
    }
  }

  private fillTable(data) {
    this.tableInput.results = [];
    if (!data.data[0] || !data.data[0][1]) {
      this.tableFilled.next(true);
      return;
    }

    this.tableInput.isNodeData = !this.filteringRule.isEdge;
    let keySet = new Set<string>();

    for (let i = 0; i < data.data.length; i++) {
      for (let [k, v] of Object.entries(data.data[i][1])) {
        keySet.add(k);
      }
    }

    this.tableInput.columns = [...keySet];

    for (let i = 0; i < data.data.length; i++) {
      // first column is ID
      let d: TableData[] = [{ val: data.data[i][0], type: TableDataType.string }];
      // j is column index
      let j = 0;
      for (let [k, v] of Object.entries(data.data[i][1])) {
        let idx = this.tableInput.columns.indexOf(k);
        if (idx > -1) {
          d[idx + 1] = this.rawData2TableData(k, v);
        } else {
          d[j] = { val: '', type: TableDataType.string };
        }
        j++;
      }
      for (j = 0; j < d.length; j++) {
        if (!d[j]) {
          d[j] = { val: '', type: TableDataType.string };
        }
      }
      this.tableInput.results.push(d)
    }
    this.tableFilled.next(true);
  }

  private rawData2TableData(key: string, val: any): TableData {
    let t = '';
    let cName = this.filteringRule.className;
    if (this.filteringRule.isEdge) {
      t = properties.edges[cName][key];
    } else {
      t = properties.nodes[cName][key];
    }
    if (t.startsWith('enum')) {
      return { val: AppDescription.enumMapping[cName][key][val], type: TableDataType.enum };
    } else if (t == 'string' || t == 'list') {
      return { val: val, type: TableDataType.string };
    } else if (t == 'datetime') {
      return { val: val, type: TableDataType.datetime };
    } else if (t == 'float' || t == 'int') {
      return { val: val, type: TableDataType.number };
    } else {
      return { val: 'see rawData2TableData function', type: TableDataType.string };
    }
  }

  maintainChartRange(s: number, e: number) {
    if (this._g.userPrefs.timebar.isMaintainGraphRange.value) {
      this._timebarService.setChartRange(s, e);
    }
  }

  runFiltering() {
    const arr = this._timebarService.getChartRange();
    if (this.isFilterOnDb) {
      this.runFilteringOnDatabase(this.maintainChartRange, arr);
    } else {
      this.runFilteringOnClient(this.maintainChartRange, arr);
    }
  }

  filterElesByClass(event) {
    const source = $(event.target);
    const willBeShowed = source.hasClass(FILTER_CLASS_HIDE);
    const classText = source.text();

    source.blur();
    source.toggleClass(FILTER_CLASS_HIDE);

    if (willBeShowed) {
      this._g.hiddenClasses.delete(classText);
      this._g.viewUtils.show(this._g.cy.$('.' + classText));
    }
    else {
      this._g.hiddenClasses.add(classText);
      this._g.viewUtils.hide(this._g.cy.$('.' + classText));
    }
    this._g.shownElemsChanged.next(true);
    this._g.performLayout(false);
  }

  pageChanged(newPage: number) {
    const skip = (newPage - 1) * this.tableInput.pageSize;
    const limit = this.tableInput.pageSize;
    const isMerge = this.tableInput.isMergeGraph && this._g.cy.elements().length > 0;
    const arr = this._timebarService.getChartRange();
    this.loadGraph(skip, limit, isMerge, this.maintainChartRange, arr);
    this.loadTable(skip, limit);
  }

  getDataForQueryResult(e: TableRowMeta) {
    let isNode = !this.filteringRule.isEdge;
    let fn = (x) => { this._cyService.loadElementsFromDatabase(x, this.tableInput.isMergeGraph) };
    this._dbService.getNeighbors(e.dbIds, fn, e.tableIdx.join(','), isNode, 'Loaded from table: ');
  }

  resetRule() {
    this.filteringRule = null;
    this.tableInput = { columns: [], results: [], resultCnt: 0, currPage: 1, pageSize: this.tableInput.pageSize, isLoadGraph: true, isMergeGraph: true, isNodeData: true };
    this.isClassTypeLocked = false;
    this.selectedClass = this.classOptions[0].text;
    this.changeSelectedClass();
  }

  groupTabCliked() {
    this.isGroupTabOpen = !this.isGroupTabOpen;
    if (this.isGroupTabOpen) {
      this.groupComponent.componentOpened();
    }
  }

  filterTable(filter: TableFiltering) {
    this.tableInput.currPage = 1;
    const limit = this.tableInput.pageSize;
    this.getCountOfData(filter);
    let skip = filter.skip ? filter.skip : 0;
    this._dbService.filterTable(this.filteringRule, filter, skip, limit, DbQueryType.table, (x) => { this.fillTable(x) });
  }

  editRule(i: number) {
    this.isAddingNewRule = false;
    this.changeBtnTxt = 'Update';
    this.resetRule();
    let curr = this.currRules[i];
    if (!curr.isEditing) {
      this.resetEditingRules();
      curr.isEditing = true;
      this.filteringRule = deepCopy(curr.rules);
      this.currRuleName = curr.name;
      this.isFilterOnDb = curr.isOnDb;
      this.tableInput.isMergeGraph = curr.isMergeGraph;
      this.tableInput.isLoadGraph = curr.isLoadGraph;
      this.selectedClass = this.filteringRule.className;
      this.changeSelectedClass();
      this.isClassTypeLocked = true;
      this._profile.saveFilteringRules(this.currRules);
    }
  }

  resetEditingRules() {
    for (let i = 0; i < this.currRules.length; i++) {
      this.currRules[i].isEditing = false;
    }
    this._profile.saveFilteringRules(this.currRules);
  }

  deleteRule(i: number) {
    this.currRules.splice(i, 1);
    if (this.currRules.length < 1) {
      this.newRuleClick();
    }
    this._profile.saveFilteringRules(this.currRules);
  }

  newRuleClick() {
    this.isAddingNewRule = true;
    this.changeBtnTxt = 'Add';
    this.currRuleName = 'New rule';
    this.resetEditingRules();
    this.resetRule();
  }

  private updateRule() {
    let idx = this.getEditingRuleIdx();
    this.currRules[idx].rules = deepCopy(this.filteringRule);
    this.currRules[idx].name = this.currRuleName;
    this.currRules[idx].isLoadGraph = this.tableInput.isLoadGraph;
    this.currRules[idx].isMergeGraph = this.tableInput.isMergeGraph;
    this.currRules[idx].isOnDb = this.isFilterOnDb;
  }

  private getEditingRuleIdx(): number {
    for (let i = 0; i < this.currRules.length; i++) {
      if (this.currRules[i].isEditing) {
        return i;
      }
    }
    return -1;
  }

  private addRule() {
    if (this.filteringRule == null || this.filteringRule == undefined) {
      return;
    }
    this.resetEditingRules();
    this.currRules.push({
      rules: deepCopy(this.filteringRule),
      name: this.currRuleName, isEditing: true, isOnDb: this.isFilterOnDb, isLoadGraph: this.tableInput.isLoadGraph, isMergeGraph: this.tableInput.isMergeGraph
    });
    this.isAddingNewRule = false;
    this.changeBtnTxt = 'Update';
  }

  addOrUpdateRule() {
    if (this.isAddingNewRule) {
      this.addRule();
    } else {
      this.updateRule();
    }
    this._profile.saveFilteringRules(this.currRules);
  }
}

