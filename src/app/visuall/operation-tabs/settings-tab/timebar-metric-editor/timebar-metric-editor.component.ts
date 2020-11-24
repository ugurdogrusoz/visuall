import { Component, OnInit } from '@angular/core';
import { ClassOption, TimebarMetric, Rule, RuleSync, getBoolExpressionFromMetric, RuleNode, deepCopyTimebarMetric } from '../../map-tab/query-types';
import { GENERIC_TYPE } from '../../../constants';
import { TimebarService } from '../../../timebar.service';
import { UserProfileService } from '../../../user-profile.service';
import { Subject } from 'rxjs';
import { GlobalVariableService } from '../../../global-variable.service';
import { CustomizationModule } from '../../../../custom/customization.module';

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
  filteringRule: TimebarMetric;
  currMetrics: TimebarMetric[];
  currMetricName: string = 'new';
  currMetricColor: string = null;
  isAClassSelectedForMetric = false;
  newStatBtnTxt = 'Add';
  isHideEditing = true;
  isAddingNew = false;
  isGenericTypeSelected = true;
  isSumMetric = false;
  currProperties: Subject<RuleSync> = new Subject<RuleSync>();
  editingPropertyRule: Rule;
  currRuleNode: RuleNode;
  isShowPropertyRule = true;
  editedRuleNode: Subject<RuleNode> = new Subject<RuleNode>();

  constructor(private _g: GlobalVariableService, private _timeBarService: TimebarService, private _profile: UserProfileService) {
    this.classOptions = [];
    this.selectedClassProps = [];
    this.filteringRule = null

    this.currMetrics = CustomizationModule.defaultTimebarMetrics;

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
    this._g.appDescription.subscribe(x => {
      if (x) {
        this._g.dataModel.subscribe(x2 => {
          if (x2) {
            this.classOptions.push({ text: GENERIC_TYPE.ANY_CLASS, isDisabled: false });
            this.classOptions.push({ text: GENERIC_TYPE.NODES_CLASS, isDisabled: false });

            for (const key in x2.nodes) {
              this.classOptions.push({ text: key, isDisabled: false });
              if (this.selectedClassProps.length == 0) {
                this.selectedClassProps = Object.keys(x2.nodes[key]);
              }
            }

            this.classOptions.push({ text: GENERIC_TYPE.EDGES_CLASS, isDisabled: false });
            for (const key in x2.edges) {
              this.classOptions.push({ text: key, isDisabled: false });
            }
            this.clearInput();
          }
        }, (e) => { console.log('error: ', e); });
      }
    }, (e) => { console.log('error: ', e); });

  }

  initRules(s: 'AND' | 'OR' | 'C') {
    this.editingPropertyRule = null;
    const p = this._g.dataModel.getValue();
    const isEdge = p.edges[this.selectedClass] != undefined;
    if (!this.currMetricName) {
      this.currMetricName = '';
    }
    if (s == 'AND' || s == 'OR') {
      this.filteringRule = { rules: { r: { ruleOperator: s }, children: [], parent: null }, name: this.currMetricName, incrementFn: null, isEdge: isEdge, className: this.selectedClass, color: this.currMetricColor };
    } else if (s == 'C') {
      this.filteringRule = { rules: { r: null, children: [], parent: null }, name: this.currMetricName, incrementFn: null, isEdge: isEdge, className: this.selectedClass, color: this.currMetricColor };
    }
    this.currRuleNode = this.filteringRule.rules;
    this.changeSelectedClass();
  }

  getStyleForMetric(m: TimebarMetric) {
    if (m.isEditing) {
      return { 'background-color': '#eaeaea' };
    }
    return { 'background-color': `rgba(${m.color.slice(1, 3)}, ${m.color.slice(3, 5)}, ${m.color.slice(5, 7)}, 0.5)` }
  }

  changeSelectedClass() {
    const txt = this.selectedClass;
    const p = this._g.dataModel.getValue();
    let isNodeClassSelected: boolean = p.nodes.hasOwnProperty(txt);
    let isEdgeClassSelected: boolean = p.edges.hasOwnProperty(txt);
    this.selectedClassProps.length = 0;
    this.selectedClassProps.push(GENERIC_TYPE.NOT_SELECTED);

    if (isNodeClassSelected) {
      this.selectedClassProps.push(...Object.keys(p.nodes[txt]));
      this.selectedClassProps.push(...this.getEdgeTypesRelated());
      this.isGenericTypeSelected = false;
    } else if (isEdgeClassSelected) {
      this.selectedClassProps.push(...Object.keys(p.edges[txt]));
      this.isGenericTypeSelected = false;
    } else {
      this.isGenericTypeSelected = true;
    }
    setTimeout(() => {
      this.currProperties.next({ properties: this.selectedClassProps, isGenericTypeSelected: false, selectedClass: this.selectedClass });
    }, 0);
  }

  addRule2FilteringRules(r: Rule) {
    if (r.propertyType == 'datetime') {
      r.inputOperand = new Date(r.rawInput).toLocaleString();
    }

    this.filteringRule.name = this.currMetricName;
    this.filteringRule.color = this.currMetricColor;
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

    this.putSumRule2Root(r);
    this.isAClassSelectedForMetric = true;
    this.isSumMetric = this.isSumRule(this.filteringRule.rules.r); // sum rule should be at the root if it exists 
    this.isShowPropertyRule = r.ruleOperator !== null;
  }

  showPropertyRule(e: { node: RuleNode, isEdit: boolean }) {
    this.currRuleNode = e.node;
    // means edit is clicked in rule tree
    if (!e.isEdit) {
      this.isShowPropertyRule = true;
      this.changeSelectedClass();
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
    this.isAClassSelectedForMetric = false;
    this.filteringRule.rules = null;
    this.isShowPropertyRule = true;
    if (this.filteringRule.rules) {
      this.isSumMetric = this.isSumRule(this.filteringRule.rules.r);
    } else {
      this.isSumMetric = false;
    }
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
      this.filteringRule = this.currMetrics[i];
      this.currRuleNode = this.filteringRule.rules;
      this.currMetricName = this.currMetrics[i].name;
      this.currMetricColor = this.currMetrics[i].color;
      this.selectedClass = this.currMetrics[i].className;
      this.changeSelectedClass();
      this.isAClassSelectedForMetric = true;
      this.newStatBtnTxt = 'Update';
      this.isSumMetric = this.isSumRule(this.filteringRule.rules.r);
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
    this.filteringRule.name = this.currMetricName;
    this.filteringRule.color = this.currMetricColor;
    if (this.editingIdx != -1) {
      this.currMetrics[this.editingIdx] = deepCopyTimebarMetric(this.filteringRule);
      this.currMetrics[this.editingIdx].isEditing = false;
    } else {
      this.currMetrics.push(deepCopyTimebarMetric(this.filteringRule));
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
      let fnStr = getBoolExpressionFromMetric(m);
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
    return r && (!r.operator) && (r.propertyType == 'int' || r.propertyType == 'float' || r.propertyType == 'edge');
  }

  private putSumRule2Root(r: Rule) {
    const isSum = this.isSumRule(r);
    if (!isSum) {
      return;
    }

    // if root is already a sum rule, replace the root
    if (this.isSumRule(this.filteringRule.rules.r)) {
      const newNode: RuleNode = { parent: null, children: this.filteringRule.rules.children, r: r };
      this.filteringRule.rules = newNode;
    } else { // add sum rule as root
      const newNode: RuleNode = { parent: null, children: [this.filteringRule.rules], r: r };
      this.filteringRule.rules = newNode;
    }
  }

  private refreshTimebar() {
    this._timeBarService.shownMetrics.next(this.currMetrics);
  }

  private clearInput() {
    this.filteringRule = null;
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
      this.clearAllEditings(m.rules);
    }
    this.editingIdx = -1;
  }

  clearAllEditings(r: RuleNode) {
    if (r === undefined || r === null) {
      return;
    }
    r.isEditing = false;
    for (const child of r.children) {
      this.clearAllEditings(child);
    }
  }

  private getEdgeTypesRelated(): string[] {
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

}
