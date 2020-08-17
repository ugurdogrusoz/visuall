import { Component, OnInit } from '@angular/core';
import properties from '../../../../assets/generated/properties.json';
import AppDescription from '../../../../assets/app_description.json';
import { ClassOption, TimebarMetric, TimebarMetric2, Rule, RuleSync, getBoolExpressionFromMetric2, RuleNode, deepCopyRuleNode, deepCopyTimebarMetric } from '../../map-tab/query-types';
import { GENERIC_TYPE } from '../../../constants';
import { TimebarService } from '../../../timebar.service';
import { Subject } from 'rxjs';
import { UserProfileService } from 'src/app/user-profile.service';

@Component({
  selector: 'app-timebar-metric-editor',
  templateUrl: './timebar-metric-editor.component.html',
  styleUrls: ['./timebar-metric-editor.component.css']
})
export class TimebarMetricEditorComponent implements OnInit {

  private editingIdx = -1;
  classOptions: ClassOption[];
  selectedClassProps: string[];
  selectedClass: string;
  filteringRule2: TimebarMetric2;
  currMetrics: TimebarMetric2[];
  currMetricName: string = 'new';
  currMetricColor: string = null;
  isAClassSelectedForMetric = false;
  newStatBtnTxt = 'Add';
  isHideEditing = true;
  isAddingNew = false;
  isGenericTypeSelected = true;
  isSumMetric = false;
  currProperties: Subject<RuleSync> = new Subject();
  currRuleNode: RuleNode;
  isShowPropertyRule = true;

  constructor(private _timeBarService: TimebarService, private _profile: UserProfileService) {
    this.classOptions = [];
    this.selectedClassProps = [];
    this.filteringRule2 = null
    const andCond: Rule = { ruleOperator: 'AND' };
    const genreCond: Rule = { propertyOperand: 'genres', propertyType: 'list', rawInput: 'Comedy', inputOperand: 'Comedy', ruleOperator: null, operator: 'in' };
    const lowRateCond: Rule = { propertyOperand: 'rating', propertyType: 'float', rawInput: '5', inputOperand: '5', ruleOperator: null, operator: '<=' };
    const higRateCond: Rule = { propertyOperand: 'rating', propertyType: 'float', rawInput: '8', inputOperand: '8', ruleOperator: null, operator: '>=' };

    const root1: RuleNode = { r: andCond, parent: null, children: [] };
    const root2: RuleNode = { r: andCond, parent: null, children: [] };
    const child1: RuleNode = { r: genreCond, parent: root1, children: [] };
    const child2: RuleNode = { r: lowRateCond, parent: root1, children: [] };
    const child3: RuleNode = { r: genreCond, parent: root2, children: [] };
    const child4: RuleNode = { r: higRateCond, parent: root2, children: [] };

    root1.children = [child1, child2];
    root2.children = [child3, child4];

    this.currMetrics = [
      { incrementFn: null, name: 'lowly rated comedies', className: 'Title', rules: root1, color: '#3366cc' },
      { incrementFn: null, name: 'highly rated comedies', className: 'Title', rules: root2, color: '#ff9900' }];

    this.setCurrMetricsFromLocalStorage();
    this.setFnsForMetrics();
    this._timeBarService.shownMetrics.next(this.currMetrics);

    this._profile.onLoadFromFile.subscribe(x => {
      if (!x) {
        return;
      }
      this.setCurrMetricsFromLocalStorage();
    });
  }

  ngOnInit() {
    this.classOptions.push({ text: GENERIC_TYPE.ANY_CLASS, isDisabled: false });
    this.classOptions.push({ text: GENERIC_TYPE.NODES_CLASS, isDisabled: false });
    for (const key in properties.nodes) {
      this.classOptions.push({ text: key, isDisabled: false });
      if (this.selectedClassProps.length == 0) {
        this.selectedClassProps = Object.keys(properties.nodes[key]);
      }
    }

    this.classOptions.push({ text: GENERIC_TYPE.EDGES_CLASS, isDisabled: false });
    for (const key in properties.edges) {
      this.classOptions.push({ text: key, isDisabled: false });
    }
    this.clearInput();
  }

  getStyleForMetric(m: TimebarMetric) {
    if (m.isEditing) {
      return { 'background-color': '#eaeaea' };
    }
    return { 'background-color': `rgba(${m.color.slice(1, 3)}, ${m.color.slice(3, 5)}, ${m.color.slice(5, 7)}, 0.5)` }
  }

  changeSelectedClass() {
    const txt = this.selectedClass;
    let isNodeClassSelected: boolean = properties.nodes.hasOwnProperty(txt);
    let isEdgeClassSelected: boolean = properties.edges.hasOwnProperty(txt);
    this.selectedClassProps.length = 0;
    this.selectedClassProps.push(GENERIC_TYPE.NOT_SELECTED);

    if (isNodeClassSelected) {
      this.selectedClassProps.push(...Object.keys(properties.nodes[txt]));
      this.selectedClassProps.push(...this.getEdgeTypesRelated());
      this.isGenericTypeSelected = false;
    } else if (isEdgeClassSelected) {
      this.selectedClassProps.push(...Object.keys(properties.edges[txt]));
      this.isGenericTypeSelected = false;
    } else {
      this.isGenericTypeSelected = true;
    }
    // update properties component on the call stack later
    setTimeout(() => {
      this.currProperties.next({ properties: this.selectedClassProps, isGenericTypeSelected: false, selectedClass: this.selectedClass });
    }, 0);
  }

  addRule2FilteringRules(r: Rule) {
    const isEdge = properties.edges.hasOwnProperty(this.selectedClass);
    r.ruleOperator = null;

    if (r.propertyType == 'datetime') {
      r.inputOperand = new Date(r.rawInput).toLocaleString();
    }
    if (!this.filteringRule2 || !this.filteringRule2.rules) {
      if (!this.currMetricName) {
        this.currMetricName = '';
      }
      this.currRuleNode = { r: r, children: [], parent: null };
      this.filteringRule2 = { rules: this.currRuleNode, name: this.currMetricName, incrementFn: null, isEdge: isEdge, className: this.selectedClass, color: this.currMetricColor };
    } else {
      this.filteringRule2.name = this.currMetricName;
      this.filteringRule2.color = this.currMetricColor;
      this.currRuleNode.children.push({ r: r, children: [], parent: this.currRuleNode });
    }
    this.putSumRule2Root(r);
    this.isAClassSelectedForMetric = true;
    this.isSumMetric = this.isSumRule(this.filteringRule2.rules.r); // sum rule should be at the root if it exists 
    this.isShowPropertyRule = false;
  }

  showPropertyRule(e: RuleNode) {
    this.isShowPropertyRule = true;
    this.currRuleNode = e;
  }

  queryRuleDeleted() {
    this.isAClassSelectedForMetric = false;
    this.filteringRule2.rules = null;
    this.isShowPropertyRule = true;
    this.isSumMetric = this.isSumRule(this.filteringRule2.rules.r);
  }

  deleteMetric(i: number) {
    if (this.currMetrics.length < 2) {
      return;
    }
    this.currMetrics.splice(i, 1);
    if (this.editingIdx == i) {
      this.clearInput();
    }
    this._profile.saveTimebarMetrics(this.currMetrics);
    this.refreshTimebar();
  }

  editMetric(i: number) {
    if (this.currMetrics[i].isEditing) {
      this.isHideEditing = true;
      this.editingIdx = -1;
      this.currMetrics[i].isEditing = false;
      this.clearInput();
      this.newStatBtnTxt = 'Add Statictic';
      this.isShowPropertyRule = true;
    } else {
      this.isShowPropertyRule = false;
      this.clearEditingOnRules();
      this.isHideEditing = false;
      this.isAddingNew = false;
      this.editingIdx = i;
      this.currMetrics[i].isEditing = true;
      this.filteringRule2 = this.currMetrics[i];
      this.currRuleNode = this.filteringRule2.rules;
      this.currMetricName = this.currMetrics[i].name;
      this.currMetricColor = this.currMetrics[i].color;
      this.selectedClass = this.currMetrics[i].className;
      this.changeSelectedClass();
      this.isAClassSelectedForMetric = true;
      this.newStatBtnTxt = 'Update';
      this.isSumMetric = this.isSumRule(this.filteringRule2.rules.r);
    }
  }

  newMetricClick() {
    this.isHideEditing = !this.isHideEditing;
    this.isAddingNew = !this.isAddingNew;
    if (this.isAddingNew) {
      this.isHideEditing = false;
      this.isShowPropertyRule = true;
    }
    if (!this.isHideEditing) {
      this.clearInput();
    }
    this.clearEditingOnRules();
  }

  addStat() {
    this.isAClassSelectedForMetric = false;
    if (!this.currMetricName || this.currMetricName.length < 2) {
      this.currMetricName = 'new';
    }
    this.filteringRule2.name = this.currMetricName;
    this.filteringRule2.color = this.currMetricColor;
    if (this.editingIdx != -1) {
      this.currMetrics[this.editingIdx] = deepCopyTimebarMetric(this.filteringRule2);
      this.currMetrics[this.editingIdx].isEditing = false;
    } else {
      this.currMetrics.push(deepCopyTimebarMetric(this.filteringRule2));
    }
    this.isHideEditing = true;
    this.isAddingNew = false;

    this._profile.saveTimebarMetrics(this.currMetrics);
    this.setFnsForMetrics();
    this.refreshTimebar();
    this.clearInput();
  }

  colorSelected(c: string) {
    this.currMetricColor = c;
  }

  private setCurrMetricsFromLocalStorage() {
    if (this._profile.isStoreProfile()) {
      let storedMetrics = this._profile.getTimebarMetrics();
      for (const m of storedMetrics) {
        this._profile.addParents(m.rules);
      }
      if (storedMetrics.length > 0) {
        this.currMetrics = storedMetrics;
      }
    }
  }

  private setFnsForMetrics() {
    for (let m of this.currMetrics) {
      let fnStr = getBoolExpressionFromMetric2(m);
      console.log(' bool expr for fn: ', fnStr);
      const isS = this.isSumRule(m.rules.r);
      if (isS) {
        const r = m.rules.r;
        if (r.propertyType == 'edge') {
          fnStr += `return x.connectedEdges('.${r.propertyOperand}').length;`
        } else {
          fnStr += `return x.data('${r.propertyOperand}');`
        }
      } else {
        fnStr += `return 1;`
      }
      fnStr += ' return 0;'
      m.incrementFn = new Function('x', fnStr) as (x: any) => number;
    }
  }

  private isSumRule(r: Rule): boolean {
    return (!r.operator) && (r.propertyType == 'int' || r.propertyType == 'float' || r.propertyType == 'edge');
  }

  private putSumRule2Root(r: Rule) {
    const isSum = this.isSumRule(r);
    if (!isSum) {
      return;
    }

    // if root is already a sum rule, replace the root
    if (this.isSumRule(this.filteringRule2.rules.r)) {
      const newNode: RuleNode = { parent: null, children: this.filteringRule2.rules.children, r: r };
      this.filteringRule2.rules = newNode;
    } else { // add sum rule as root
      const newNode: RuleNode = { parent: null, children: [this.filteringRule2.rules], r: r };
      this.filteringRule2.rules = newNode;
    }
  }

  private refreshTimebar() {
    this._timeBarService.shownMetrics.next(this.currMetrics);
  }

  private clearInput() {
    this.filteringRule2 = null;
    this.currMetricName = 'new';
    this.currMetricColor = this.getRandomColor();
    this.newStatBtnTxt = 'Add';
    this.editingIdx = -1;
    this.selectedClass = this.classOptions[0].text;
    this.isAClassSelectedForMetric = false;
    this.changeSelectedClass();
    this.isSumMetric = false;
  }

  private getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  private clearEditingOnRules() {
    for (let m of this.currMetrics) {
      m.isEditing = false;
    }
    this.editingIdx = -1;
  }

  private getEdgeTypesRelated(): string[] {
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

}
