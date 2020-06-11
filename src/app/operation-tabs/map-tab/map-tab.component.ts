import { Component, OnInit, ViewChild } from '@angular/core';
import properties from '../../../assets/generated/properties.json';
import { GENERIC_TYPE, deepCopy, COMPOUND_ELEM_NODE_CLASS, COMPOUND_ELEM_EDGE_CLASS, CLUSTER_CLASS } from '../../constants';
import { DbAdapterService } from '../../db-service/db-adapter.service';
import { CytoscapeService } from '../../cytoscape.service';
import { GlobalVariableService } from '../../global-variable.service';
import { TimebarService } from '../../timebar.service';
import { ClassOption, ClassBasedRules, Rule, RuleSync, getBoolExpressionFromMetric, QueryRule } from './query-types';
import { Subject } from 'rxjs';
import AppDescription from '../../../assets/app_description.json';
import { TableViewInput, TableData, TableDataType, TableFiltering, TableRowMeta, property2TableData } from 'src/app/table-view/table-view-types';
import { DbQueryType, GraphResponse, HistoryMetaData } from 'src/app/db-service/data-types';
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
  showNodeClass = {};
  edgeClasses: Set<string>;
  showEdgeClass = {};
  classOptions: ClassOption[];
  selectedClassProps: string[];
  selectedClass: string;
  attributeType: string;
  isDateProp: boolean;
  currDatetimes: Date[];
  queryRule: ClassBasedRules;
  isQueryOnDb: boolean;
  currProperties: Subject<RuleSync> = new Subject();
  tableInput: TableViewInput = {
    columns: [], tableTitle: 'Query Results', results: [], resultCnt: 0, currPage: 1, pageSize: 0,
    isEmphasizeOnHover: true, isLoadGraph: true, isMergeGraph: true, isNodeData: true, isReplace_inHeaders: true
  };
  tableFilled = new Subject<boolean>();
  isClassTypeLocked: boolean;
  private isGroupTabOpen = false;
  @ViewChild(GroupTabComponent, { static: false })
  private groupComponent: GroupTabComponent;
  currRules: QueryRule[] = [];
  isAddingNewRule = false;
  changeBtnTxt = 'Update';
  currRuleName = 'New rule';

  constructor(private _cyService: CytoscapeService, private _g: GlobalVariableService, private _dbService: DbAdapterService,
    private _timebarService: TimebarService, private _profile: UserProfileService) {
    this.isQueryOnDb = true;
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
        this.currRules = this._profile.getQueryRules();
      }
    });
  }

  ngOnInit() {
    this._g.userPrefs.dataPageSize.subscribe(x => { this.tableInput.pageSize = x; });

    for (const key in properties.nodes) {
      this.classOptions.push({ text: key, isDisabled: false });
      this.nodeClasses.add(key);
      this.showNodeClass[key] = true;
      if (this.selectedClassProps.length == 0) {
        this.selectedClassProps = Object.keys(properties.nodes[key]);
      }
    }

    for (const key in properties.edges) {
      this.edgeClasses.add(key);
      this.showEdgeClass[key] = true;
      this.classOptions.push({ text: key, isDisabled: false });
    }

    if (this._profile.isStoreProfile()) {
      this.currRules = this._profile.getQueryRules();
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
      this.queryRule.rules[j].ruleOperator = 'AND';
    } else {
      this.queryRule.rules[j].ruleOperator = 'OR';
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

  addRule2QueryRules(r: Rule) {
    const isEdge = this.edgeClasses.has(this.selectedClass);

    if (r.propertyType == 'datetime') {
      r.inputOperand = new Date(r.rawInput).toLocaleString();
    }
    if (!this.queryRule) {
      this.queryRule = { className: this.selectedClass, rules: [r], isEdge: isEdge };
    } else {
      this.queryRule.rules.push(r);
    }
    this.isClassTypeLocked = true;
  }

  deleteQueryRule(j: number) {
    if (this.queryRule.rules.length == 1) {
      this.queryRule = null;
      this.isClassTypeLocked = false;
    } else {
      this.queryRule.rules.splice(j, 1);
    }
  }

  changeQueryRuleOrder(j: number, isUp: boolean) {
    if ((isUp && j == 0) || (!isUp && j == this.queryRule.rules.length - 1)) {
      return;
    }
    let idx = j + 1;
    if (isUp) {
      idx = j - 1;
    }
    let tmp = this.queryRule.rules[j];
    this.queryRule.rules[j] = this.queryRule.rules[idx];
    this.queryRule.rules[idx] = tmp;
  }

  runQueryOnClient(cb: (s: number, end: number) => void, cbParams: any[]) {
    let fnStr = getBoolExpressionFromMetric(this.queryRule) + ' return true; return false;';
    let filteredClassElems = this._g.cy.filter(new Function('x', fnStr));
    filteredClassElems.merge(filteredClassElems.connectedNodes());
    const newElemIndicator = this._g.userPrefs.mergedElemIndicator.getValue();
    if (newElemIndicator == MergedElemIndicatorTypes.highlight) {
      this._g.highlightElems(filteredClassElems);
    } else if (newElemIndicator == MergedElemIndicatorTypes.selection) {
      filteredClassElems.select();
    }
    this._g.applyClassFiltering();
    this._g.performLayout(false);
    cb.apply(this, cbParams);
  }

  runQueryOnDatabase(cb: (s: number, end: number) => void, cbParams: any[]) {
    if (!this.queryRule || Object.keys(this.queryRule).length === 0) {
      console.log('there is no query rule');
      return;
    }
    const skip = (this.tableInput.currPage - 1) * this.tableInput.pageSize;
    const limit = this.tableInput.pageSize;
    const isMerge = this.tableInput.isMergeGraph && this._g.cy.elements().length > 0;

    this.getCountOfData();
    this.loadGraph(skip, limit, isMerge, cb, cbParams, null);
    this.loadTable(skip, limit);
  }

  private loadGraph(skip: number, limit: number, isMerge: boolean, cb: (s: number, end: number) => void, cbParams: any[], filter: TableFiltering) {
    if (!this.tableInput.isLoadGraph) {
      return;
    }
    this._dbService.getFilteringResult(this.queryRule, filter, skip, limit, DbQueryType.std,
      (x) => { this._cyService.loadElementsFromDatabase(x as GraphResponse, isMerge); cb.apply(this, cbParams); });

  }

  private loadTable(skip: number, limit: number, filter: TableFiltering = null) {
    this._dbService.getFilteringResult(this.queryRule, filter, skip, limit, DbQueryType.table, (x) => { this.fillTable(x) });
  }

  private getCountOfData(filter: TableFiltering = null) {
    if (filter != null) {
      this._dbService.filterTable(this.queryRule, filter, 0, -1, DbQueryType.count, (x) => { this.tableInput.resultCnt = x['data'][0]; });
    } else {
      this._dbService.getFilteringResult(this.queryRule, filter, 0, -1, DbQueryType.count, (x) => { this.tableInput.resultCnt = x['data'][0]; });
    }
  }

  private fillTable(data) {
    this.tableInput.results = [];
    if (!data.data[0] || !data.data[0][1]) {
      this.tableFilled.next(true);
      return;
    }

    this.tableInput.isNodeData = !this.queryRule.isEdge;

    if (this.tableInput.isNodeData) {
      this.tableInput.columns = Object.keys(properties['nodes'][this.selectedClass]);
    } else {
      this.tableInput.columns = Object.keys(properties['edges'][this.selectedClass]);
    }

    for (let i = 0; i < data.data.length; i++) {
      // first column is ID
      let d: TableData[] = [{ val: data.data[i][0], type: TableDataType.string }];
      for (let [k, v] of Object.entries(data.data[i][1])) {
        let idx = this.tableInput.columns.indexOf(k);
        if (idx > -1) {
          d[idx + 1] = property2TableData(k, v, this.queryRule.className, this.queryRule.isEdge)
        }
      }
      for (let j = 0; j < this.tableInput.columns.length + 1; j++) {
        if (!d[j]) {
          d[j] = { val: '', type: TableDataType.string };
        }
      }
      this.tableInput.results.push(d)
    }
    this.tableFilled.next(true);
  }

  maintainChartRange(s: number, e: number) {
    if (this._g.userPrefs.timebar.isMaintainGraphRange.value) {
      this._timebarService.setChartRange(s, e);
    }
  }

  runQuery() {
    const arr = this._timebarService.getChartRange();
    if (this.isQueryOnDb) {
      this.runQueryOnDatabase(this.maintainChartRange, arr);
    } else {
      this.runQueryOnClient(this.maintainChartRange, arr);
    }
  }

  filterElesByClass(className: string, isNode: boolean) {
    let willBeShowed = false;
    if (isNode) {
      this.showNodeClass[className] = !this.showNodeClass[className];
      willBeShowed = this.showNodeClass[className];
    } else {
      this.showEdgeClass[className] = !this.showEdgeClass[className];
      willBeShowed = this.showEdgeClass[className];
    }
    if (willBeShowed) {
      this._g.hiddenClasses.delete(className);
      this._g.viewUtils.show(this._g.cy.$('.' + className));
    }
    else {
      this._g.hiddenClasses.add(className);
      this._g.viewUtils.hide(this._g.cy.$('.' + className));
    }
    this.filter4Collapsed(className, willBeShowed);
    this._g.shownElemsChanged.next(true);
    this._g.performLayout(false);
  }

  private filter4Collapsed(className: string, isShow: boolean) {
    const classCSS = '.' + className;

    // apply filter to collapsed nodes, if they are not collapsed it should be already applied
    const metaNodes = this._g.cy.nodes('.' + COMPOUND_ELEM_NODE_CLASS);
    for (let i = 0; i < metaNodes.length; i++) {
      if (isShow) {
        this._g.viewUtils.show(metaNodes[i].data('collapsedChildren').filter(classCSS));
      } else {
        this._g.viewUtils.hide(metaNodes[i].data('collapsedChildren').filter(classCSS));
      }
    }

    // apply filter to collapsed edges, if they are not collapsed it should be already applied
    const metaEdges = this._g.cy.edges('.' + COMPOUND_ELEM_EDGE_CLASS);
    for (let i = 0; i < metaEdges.length; i++) {
      if (isShow) {
        this._g.viewUtils.show(metaEdges[i].data('collapsedEdges').filter(classCSS));
      } else {
        this._g.viewUtils.hide(metaEdges[i].data('collapsedEdges').filter(classCSS));
      }
    }
    this._g.handleCompoundsOnHideDelete();
  }

  getDataForQueryResult(e: TableRowMeta) {
    let fn = (x) => { this._cyService.loadElementsFromDatabase(x, this.tableInput.isMergeGraph) };
    let historyMeta: HistoryMetaData = { customTxt: 'Loaded from table: ', isNode: !this.queryRule.isEdge, labels: e.tableIdx.join(',') }
    this._dbService.getNeighbors(e.dbIds, fn, historyMeta, { isEdgeQuery: this.queryRule.isEdge });
  }

  resetRule() {
    this.queryRule = null;
    this.tableInput = {
      columns: [], tableTitle: 'Query Results', results: [], resultCnt: 0, currPage: 1, pageSize: this.tableInput.pageSize,
      isEmphasizeOnHover: true, isLoadGraph: true, isMergeGraph: true, isNodeData: true, isReplace_inHeaders: true
    };
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
    this._dbService.filterTable(this.queryRule, filter, skip, limit, DbQueryType.table, (x) => { this.fillTable(x) });
    this.loadGraph(skip, limit, this.tableInput.isMergeGraph, this.maintainChartRange.bind(this), this._timebarService.getChartRange(), filter);
  }

  editRule(i: number) {
    let curr = this.currRules[i];
    if (curr.isEditing) {
      return;
    }
    this.isAddingNewRule = false;
    this.changeBtnTxt = 'Update';
    this.resetRule();
    this.resetEditingRules();
    curr.isEditing = true;
    this.queryRule = deepCopy(curr.rules);
    this.currRuleName = curr.name;
    this.isQueryOnDb = curr.isOnDb;
    this.tableInput.isMergeGraph = curr.isMergeGraph;
    this.tableInput.isLoadGraph = curr.isLoadGraph;
    this.selectedClass = this.queryRule.className;
    this.changeSelectedClass();
    this.isClassTypeLocked = true;
    this._profile.saveQueryRules(this.currRules);
  }

  resetEditingRules() {
    for (let i = 0; i < this.currRules.length; i++) {
      this.currRules[i].isEditing = false;
    }
    this._profile.saveQueryRules(this.currRules);
  }

  deleteRule(i: number) {
    this.currRules.splice(i, 1);
    if (this.currRules.length < 1) {
      this.newRuleClick();
    }
    this._profile.saveQueryRules(this.currRules);
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
    this.currRules[idx].rules = deepCopy(this.queryRule);
    this.currRules[idx].name = this.currRuleName;
    this.currRules[idx].isLoadGraph = this.tableInput.isLoadGraph;
    this.currRules[idx].isMergeGraph = this.tableInput.isMergeGraph;
    this.currRules[idx].isOnDb = this.isQueryOnDb;
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
    if (this.queryRule == null || this.queryRule == undefined) {
      return;
    }
    this.resetEditingRules();
    this.currRules.push({
      rules: deepCopy(this.queryRule),
      name: this.currRuleName, isEditing: true, isOnDb: this.isQueryOnDb, isLoadGraph: this.tableInput.isLoadGraph, isMergeGraph: this.tableInput.isMergeGraph
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
    this._profile.saveQueryRules(this.currRules);
  }
}

