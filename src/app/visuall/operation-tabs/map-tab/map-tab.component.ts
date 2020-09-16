import { Component, OnInit, ViewChild } from '@angular/core';
import { GENERIC_TYPE, COLLAPSED_EDGE_CLASS, CLUSTER_CLASS } from '../../constants';
import { DbAdapterService } from '../../db-service/db-adapter.service';
import { CytoscapeService } from '../../cytoscape.service';
import { GlobalVariableService } from '../../global-variable.service';
import { TimebarService } from '../../timebar.service';
import { ClassOption, Rule, RuleSync, QueryRule, ClassBasedRules, RuleNode, getBoolExpressionFromMetric, deepCopyRuleNode } from './query-types';
import { Subject } from 'rxjs';
import { TableViewInput, TableData, TableDataType, TableFiltering, TableRowMeta, property2TableData } from '../../../shared/table-view/table-view-types';
import { DbQueryType, GraphResponse, HistoryMetaData } from '../../db-service/data-types';
import { GroupTabComponent } from './group-tab/group-tab.component';
import { MergedElemIndicatorTypes } from '../../user-preference.js';
import { UserProfileService } from '../../user-profile.service';

@Component({
  selector: 'app-map-tab',
  templateUrl: './map-tab.component.html',
  styleUrls: ['./map-tab.component.css']
})
export class MapTabComponent implements OnInit {

  classOptions: ClassOption[];
  selectedClassProps: string[];
  selectedClass: string;
  attributeType: string;
  isDateProp: boolean;
  currDatetimes: Date[];
  queryRule: ClassBasedRules;
  currRuleNode: RuleNode;
  editedRuleNode: Subject<RuleNode> = new Subject<RuleNode>();
  isQueryOnDb: boolean;
  currProperties: Subject<RuleSync> = new Subject<RuleSync>();
  editingPropertyRule: Rule;
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
  isShowPropertyRule = true;

  constructor(private _cyService: CytoscapeService, private _g: GlobalVariableService, private _dbService: DbAdapterService,
    private _timebarService: TimebarService, private _profile: UserProfileService) {
    this.isQueryOnDb = true;
    this.tableInput.isMergeGraph = true;
    this.classOptions = [];
    this.selectedClassProps = [];
    this.isDateProp = false;
    this.currDatetimes = [new Date()];
    this._profile.onLoadFromFile.subscribe(x => {
      if (!x) {
        return;
      }
      this.setCurrRulesFromLocalStorage();
    });
  }

  ngOnInit() {
    this._g.userPrefs.dataPageSize.subscribe(x => { this.tableInput.pageSize = x; });

    this._g.appDescription.subscribe(x => {
      if (x === null) {
        return;
      }
      this._g.dataModel.subscribe(x2 => {
        if (x2 === null) {
          return;
        }
        for (const key in x2.nodes) {
          this.classOptions.push({ text: key, isDisabled: false });
          if (this.selectedClassProps.length == 0) {
            this.selectedClassProps = Object.keys(x2.nodes[key]);
          }
        }

        for (const key in x2.edges) {
          this.classOptions.push({ text: key, isDisabled: false });
        }

        this.setCurrRulesFromLocalStorage();
        let i = this.getEditingRuleIdx();
        if (i > -1) {
          this.currRules[i].isEditing = false; // simulate click
          this.editRule(i);
        } else {
          this.newRuleClick();
        }
      });
    });
  }

  private setCurrRulesFromLocalStorage() {
    if (this._profile.isStoreProfile()) {
      let storedRules = this._profile.getQueryRules();
      for (const m of storedRules) {
        this._profile.addParents(m.rules.rules);
      }
      this.currRules = storedRules;
    }
  }

  changeSelectedClass() {
    const txt = this.selectedClass;
    const properties = this._g.dataModel.getValue();
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
    setTimeout(() => {
      this.currProperties.next({ properties: this.selectedClassProps, isGenericTypeSelected: isGeneric, selectedClass: this.selectedClass });
    }, 0);
  }

  private getEdgeTypesRelated(nodeType: string): string[] {
    let r: string[] = [];
    const a = this._g.appDescription.getValue();
    const txt = this.selectedClass.toLowerCase();
    for (let k of Object.keys(a.relations)) {
      const v = a.relations[k];
      if (v.source.toLowerCase() == txt || v.target.toLowerCase() == txt) {
        r.push(k);
      }
    }
    return r;
  }

  initRules(s: 'AND' | 'OR' | 'C') {
    const properties = this._g.dataModel.getValue();
    const isEdge = properties.edges[this.selectedClass] != undefined;
    if (s == 'AND' || s == 'OR') {
      this.queryRule = { className: this.selectedClass, isEdge: isEdge, rules: { r: { ruleOperator: s }, children: [], parent: null } };
    } else if (s == 'C') {
      this.queryRule = { className: this.selectedClass, isEdge: isEdge, rules: { r: null, children: [], parent: null } };
    }
    this.currRuleNode = this.queryRule.rules;
    this.changeSelectedClass();
  }

  addRule2QueryRules(r: Rule) {
    if (r.propertyType == 'datetime') {
      r.inputOperand = new Date(r.rawInput).toLocaleString();
    }

    if (this.currRuleNode.r) {
      if (this.currRuleNode.isEditing) {
        this.currRuleNode.r = r;
        this.editedRuleNode.next(this.currRuleNode);
      } else {
        this.currRuleNode.children.push({ r: r, children: [], parent: this.currRuleNode });
      }
    } else {
      // if "Condition" is clicked at the start
      this.currRuleNode.r = r;
    }
    this.isClassTypeLocked = true;
    this.isShowPropertyRule = r.ruleOperator !== null;
  }

  showPropertyRule(e: { node: RuleNode, isEdit: boolean }) {
    this.currRuleNode = e.node;
    // means edit is clicked in rule tree
    if (!e.isEdit) {
      this.isShowPropertyRule = true;
      return;
    }
    this.isShowPropertyRule = false;
    // let the UI for property rule re-rendered
    setTimeout(() => {
      this.isShowPropertyRule = e.node.isEditing;
      this.changeSelectedClass();
      if (e.node.isEditing) {
        this.editingPropertyRule = e.node.r;
      } else {
        this.editingPropertyRule = null;
      }
    });
  }

  newOperator(e: RuleNode) {
    this.isShowPropertyRule = true;
    this.currRuleNode = e;
  }

  queryRuleDeleted() {
    this.isClassTypeLocked = false;
    this.queryRule.rules = null;
    this.isShowPropertyRule = true;
  }

  runQueryOnClient(cb: (s: number, end: number) => void, cbParams: any[]) {
    let fnStr2 = getBoolExpressionFromMetric(this.queryRule) + ' return true; return false;';
    console.log('function str 2: ', fnStr2);

    let filteredClassElems = this._g.cy.filter(new Function('x', fnStr2));
    filteredClassElems.merge(filteredClassElems.connectedNodes());
    const newElemIndicator = this._g.userPrefs.mergedElemIndicator.getValue();
    if (newElemIndicator == MergedElemIndicatorTypes.highlight) {
      this._g.highlightElems(filteredClassElems);
    } else if (newElemIndicator == MergedElemIndicatorTypes.selection) {
      this._g.isSwitch2ObjTabOnSelect = false;
      filteredClassElems.select();
      this._g.isSwitch2ObjTabOnSelect = true;
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
    const properties = this._g.dataModel.getValue();
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
          const enumMapping = this._g.appDescription.getValue().enumMapping;
          d[idx + 1] = property2TableData(properties, enumMapping, k, v, this.queryRule.className, this.queryRule.isEdge);
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

  filterElesByClass(e: { className: string, willBeShowed: boolean }) {
    if (e.willBeShowed) {
      this._g.hiddenClasses.delete(e.className);
      this._g.viewUtils.show(this._g.cy.$('.' + e.className));
    }
    else {
      this._g.hiddenClasses.add(e.className);
      this._g.viewUtils.hide(this._g.cy.$('.' + e.className));
    }
    this.filter4Collapsed(e.className, e.willBeShowed);
    this._g.shownElemsChanged.next(true);
    this._g.performLayout(false);
  }

  private filter4Collapsed(className: string, isShow: boolean) {
    const classCSS = '.' + className;

    // apply filter to collapsed nodes, if they are not collapsed it should be already applied
    const clusterNodes = this._g.cy.nodes('.' + CLUSTER_CLASS);
    for (let i = 0; i < clusterNodes.length; i++) {
      this.filter4CompoundNode(clusterNodes[i], classCSS, isShow);
    }

    // apply filter to collapsed edges, if they are not collapsed it should be already applied
    const compoundEdges = this._g.cy.edges('.' + COLLAPSED_EDGE_CLASS);
    for (let i = 0; i < compoundEdges.length; i++) {
      this.filter4CompoundEdge(compoundEdges[i], classCSS, isShow);
    }
    this._g.handleCompoundsOnHideDelete();
  }

  private filter4CompoundNode(node, classCSS: string, isShow: boolean) {
    let children = node.children(); // a node might have children
    const collapsed = node.data('collapsedChildren'); // a node might a collapsed 
    if (collapsed) {
      children = children.union(collapsed);
    }
    for (let i = 0; i < children.length; i++) {
      if (isShow) {
        this._g.viewUtils.show(children[i].filter(classCSS));
      } else {
        this._g.viewUtils.hide(children[i].filter(classCSS));
      }
    }
    // recursively apply for complex children
    const compoundNodes = children.filter('.' + CLUSTER_CLASS);
    for (let i = 0; i < compoundNodes.length; i++) {
      this.filter4CompoundNode(compoundNodes[i], classCSS, isShow);
    }
    // a compound node might also have compound edges
    const compoundEdges = children.filter('.' + COLLAPSED_EDGE_CLASS);
    for (let i = 0; i < compoundEdges.length; i++) {
      this.filter4CompoundEdge(compoundEdges[i], classCSS, isShow);
    }
  }

  private filter4CompoundEdge(edge, classCSS: string, isShow: boolean) {
    const children = edge.data('collapsedEdges') // a node might have children
    for (let i = 0; i < children.length; i++) {
      if (isShow) {
        this._g.viewUtils.show(children[i].filter(classCSS));
      } else {
        this._g.viewUtils.hide(children[i].filter(classCSS));
      }
    }
    // recursively apply for complex children
    const complexes = children.filter('.' + COLLAPSED_EDGE_CLASS);
    for (let i = 0; i < complexes.length; i++) {
      this.filter4CompoundEdge(complexes[i], classCSS, isShow);
    }
  }

  getDataForQueryResult(e: TableRowMeta) {
    let fn = (x) => { this._cyService.loadElementsFromDatabase(x, this.tableInput.isMergeGraph) };
    let historyMeta: HistoryMetaData = { customTxt: 'Loaded from table: ', isNode: !this.queryRule.isEdge, labels: e.tableIdx.join(',') }
    this._dbService.getElems(e.dbIds, fn, { isEdgeQuery: this.queryRule.isEdge }, historyMeta);
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
    this.isShowPropertyRule = false;
    if (curr.isEditing) {
      return;
    }
    this.isAddingNewRule = false;
    this.changeBtnTxt = 'Update';
    this.resetRule();
    this.resetEditingRules();
    curr.isEditing = true;
    // this.queryRule2 = { className: curr.rules.className, isEdge: curr.rules.isEdge, rules: deepCopyRuleNode(curr.rules.rules) };
    this.queryRule = curr.rules;
    this.currRuleName = curr.name;
    this.isQueryOnDb = curr.isOnDb;
    this.tableInput.isMergeGraph = curr.isMergeGraph;
    this.tableInput.isLoadGraph = curr.isLoadGraph;
    this.selectedClass = this.queryRule.className;
    this.changeSelectedClass();
    this.isClassTypeLocked = true;
  }

  resetEditingRules() {
    for (let i = 0; i < this.currRules.length; i++) {
      this.currRules[i].isEditing = false;
    }
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
    this.isShowPropertyRule = true;
    this.resetEditingRules();
    this.resetRule();
  }

  private updateRule() {
    let idx = this.getEditingRuleIdx();
    this.currRules[idx].rules = { className: this.queryRule.className, isEdge: this.queryRule.isEdge, rules: deepCopyRuleNode(this.queryRule.rules) };
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
      rules: { className: this.queryRule.className, isEdge: this.queryRule.isEdge, rules: deepCopyRuleNode(this.queryRule.rules) },
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

