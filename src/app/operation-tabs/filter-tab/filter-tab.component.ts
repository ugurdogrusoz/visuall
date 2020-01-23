import { Component, OnInit } from '@angular/core';
import properties from '../../../assets/generated/properties.json';
import { compareUsingOperator, FILTER_CLASS_HIDE, GENERIC_TYPE } from '../../constants';
import * as $ from 'jquery';
import { DbAdapterService } from '../../db-service/db-adapter.service';
import { CytoscapeService } from '../../cytoscape.service';
import { GlobalVariableService } from '../../global-variable.service';
import { Timebar2Service } from '../../timebar2.service';
import { ClassOption, ClassBasedRules, Rule, RuleSync } from './filtering-types.js';
import { Subject } from 'rxjs';
import AppDescription from '../../../assets/app_description.json';
import { TableViewInput, TableData, TableDataType } from 'src/app/table-view/table-view-types.js';
import { DbQueryType, GraphResponse } from 'src/app/db-service/data-types.js';

@Component({
  selector: 'app-filter-tab',
  templateUrl: './filter-tab.component.html',
  styleUrls: ['./filter-tab.component.css']
})
export class FilterTabComponent implements OnInit {

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
  isClassTypeLocked: boolean;
  isTableDraggable: boolean = false;
  currTableState: Subject<boolean> = new Subject();

  constructor(private _cyService: CytoscapeService, private _g: GlobalVariableService, private _dbService: DbAdapterService, private _timebarService: Timebar2Service) {
    this.isFilterOnDb = true;
    this.tableInput.isMergeGraph = true;
    this.nodeClasses = new Set([]);
    this.edgeClasses = new Set([]);
    this.classOptions = [];
    this.selectedClassProps = [];
    this.isDateProp = false;
    this.currDatetimes = [new Date()];
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

    this.resetRule();
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
    this._g.viewUtils.hide(this._g.cy.$());

    let allClassElems = this._g.cy.$('.' + this.filteringRule.className);
    let filteredClassElems = this._g.cy.collection();
    for (let i = 0; i < this.filteringRule.rules.length; i++) {
      const rule = this.filteringRule.rules[i];
      if (i == 0) {
        filteredClassElems = allClassElems.filter(ele => { return this.filterByRule(rule, ele) });
        continue;
      }
      if (rule.ruleOperator == 'OR') {
        filteredClassElems.merge(allClassElems.filter(ele => { return this.filterByRule(rule, ele) }));
      } else if (rule.ruleOperator == 'AND') {
        filteredClassElems = filteredClassElems.filter(ele => { return this.filterByRule(rule, ele) });
      }
    }

    filteredClassElems.merge(filteredClassElems.connectedNodes());
    this._g.viewUtils.show(filteredClassElems);
    this._g.applyClassFiltering();
    this._timebarService.cyElemListChanged();
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

  private getCountOfData() {
    this._dbService.getFilteringResult(this.filteringRule, 0, -1, DbQueryType.count, (x) => { this.tableInput.resultCnt = x['data'][0]; });
  }

  private fillTable(data) {
    this.tableInput.results = [];
    if (!data.data[0] || !data.data[0][1]) {
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
    this._timebarService.cyElemListChanged();
  }

  pageChanged(newPage: number) {
    const skip = (newPage - 1) * this.tableInput.pageSize;
    const limit = this.tableInput.pageSize;
    const isMerge = this.tableInput.isMergeGraph && this._g.cy.elements().length > 0;
    const arr = this._timebarService.getChartRange();
    this.loadGraph(skip, limit, isMerge, this.maintainChartRange, arr);
    this.loadTable(skip, limit);
  }

  getDataForQueryResult(id: number) {
    this._dbService.getNeighbors(id + '', (x) => { this._cyService.loadElementsFromDatabase(x, this.tableInput.isMergeGraph) });
  }

  resetRule() {
    this.filteringRule = null;
    this.tableInput = { columns: [], results: [], resultCnt: 0, currPage: 1, pageSize: this.tableInput.pageSize, isLoadGraph: true, isMergeGraph: true, isNodeData: true };
    this.isClassTypeLocked = false;
    this.selectedClass = this.classOptions[0].text;
    this.changeSelectedClass();
  }

  changeTableState() {
    this.isTableDraggable = !this.isTableDraggable;
    this.currTableState.next(this.isTableDraggable);
  }
}

