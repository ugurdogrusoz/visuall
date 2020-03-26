import { Component, OnInit } from '@angular/core';
import properties from '../../../../assets/generated/properties.json';
import AppDescription from '../../../../assets/app_description.json';
import { ClassOption, TimebarMetric, Rule, RuleSync, getBoolExpressionFromMetric } from '../../map-tab/filtering-types';
import { GENERIC_TYPE, deepCopy } from '../../../constants';
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
  currProperties: Subject<RuleSync> = new Subject();

  constructor(private _timeBarService: TimebarService, private _profile: UserProfileService) {
    this.classOptions = [];
    this.selectedClassProps = [];
    this.filteringRule = null;
    const genreRule = { propertyOperand: 'genre', propertyType: 'string', rawInput: 'Comedy', inputOperand: 'Comedy', ruleOperator: 'AND', operator: '=' };
    let rulesHi = [genreRule, { propertyOperand: 'rating', propertyType: 'float', rawInput: '7', inputOperand: '7', ruleOperator: 'AND', operator: '>=' }];
    let rulesLo = [genreRule, { propertyOperand: 'rating', propertyType: 'float', rawInput: '5', inputOperand: '5', ruleOperator: 'AND', operator: '<=' }];
    this.currMetrics = [
      { incrementFn: null, name: 'lowly rated comedies', className: 'Movie', rules: rulesLo, color: '#3366cc' },
      { incrementFn: null, name: 'highly rated comedies', className: 'Movie', rules: rulesHi, color: '#ff9900' }];

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

    if (r.propertyType == 'datetime') {
      r.inputOperand = new Date(r.rawInput).toLocaleString();
    }
    if (!this.filteringRule) {
      if (!this.currMetricName) {
        this.currMetricName = '';
      }
      this.filteringRule = { rules: [], name: this.currMetricName, incrementFn: null, isEdge: isEdge, className: this.selectedClass, color: this.currMetricColor };
    } else {
      this.filteringRule.name = this.currMetricName;
      this.filteringRule.color = this.currMetricColor;
    }
    if (r.propertyOperand && r.propertyOperand.length > 0 && r.propertyOperand != GENERIC_TYPE.NOT_SELECTED) {
      this.filteringRule.rules.push(r);
    }
    this.putSumRuleAtStart(this.filteringRule);
    this.isAClassSelectedForMetric = true;
    this.isSumMetric = this.getIdxOfSumRule(this.filteringRule) > -1;
  }

  deleteFilterRule(j: number) {
    if (this.filteringRule.rules.length == 1) {
      this.filteringRule = null;
      if (this.editingIdx == -1) {
        this.isAClassSelectedForMetric = false;
      }
    } else {
      this.filteringRule.rules.splice(j, 1);
    }
    this.isSumMetric = this.getIdxOfSumRule(this.filteringRule) > -1;
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
    } else {
      this.clearEditingOnRules();
      this.isHideEditing = false;
      this.isAddingNew = false;
      this.editingIdx = i;
      this.currMetrics[i].isEditing = true;
      this.filteringRule = deepCopy(this.currMetrics[i]);
      this.currMetricName = this.currMetrics[i].name;
      this.currMetricColor = this.currMetrics[i].color;
      this.selectedClass = this.currMetrics[i].className;
      this.changeSelectedClass();
      this.isAClassSelectedForMetric = true;
      this.newStatBtnTxt = 'Update';
      this.isSumMetric = this.getIdxOfSumRule(this.filteringRule) > -1;
    }
  }

  newMetricClick() {
    this.isHideEditing = !this.isHideEditing;
    this.isAddingNew = !this.isAddingNew;
    if (this.isAddingNew) {
      this.isHideEditing = false;
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
      this.currMetrics[this.editingIdx] = deepCopy(this.filteringRule);
      this.currMetrics[this.editingIdx].isEditing = false;
    } else {
      this.currMetrics.push(deepCopy(this.filteringRule));
    }
    this.isHideEditing = true;
    this.isAddingNew = false;

    this._profile.saveTimebarMetrics(this.currMetrics);
    this.setFnsForMetrics();
    this.refreshTimebar();
    this.clearInput();
  }

  changeFilterRuleOrder(j: number, isUp: boolean) {
    if ((isUp && j == 0) || (!isUp && j == this.filteringRule.rules.length - 1)) {
      return;
    }
    let idx = j + 1;
    if (isUp) {
      idx = j - 1;
      // sum rule must stay at top
      if (this.isSumRule(this.filteringRule.rules[idx])) {
        return;
      }
    }

    let tmp = this.filteringRule.rules[j];
    this.filteringRule.rules[j] = this.filteringRule.rules[idx];
    this.filteringRule.rules[idx] = tmp;
  }

  ruleOperatorClicked(j: number, op: string) {
    if (op == 'OR') {
      this.filteringRule.rules[j].ruleOperator = 'AND';
    } else {
      this.filteringRule.rules[j].ruleOperator = 'OR';
    }
  }

  colorSelected(c: string) {
    this.currMetricColor = c;
  }

  private setCurrMetricsFromLocalStorage() {
    if (this._profile.isStoreProfile()) {
      let storedMetrics = this._profile.getTimebarMetrics();
      if (storedMetrics.length > 0) {
        this.currMetrics = storedMetrics;
      }
    }
  }

  private setFnsForMetrics() {
    for (let m of this.currMetrics) {
      let fnStr = getBoolExpressionFromMetric(m);
      const idxOfSumRule = this.getIdxOfSumRule(m);
      if (idxOfSumRule == -1) {
        fnStr += `return 1;`
      } else {
        const r = m.rules[idxOfSumRule];
        if (r.propertyType == 'edge') {
          fnStr += `return x.connectedEdges('.${r.propertyOperand}').length;`
        } else {
          fnStr += `return x.data().${r.propertyOperand};`
        }
      }
      fnStr += ' return 0;'
      m.incrementFn = new Function('x', fnStr) as (x: any) => number;
    }
  }

  // if there is 1 sum rule it is a Sum metric (otherwise count metric)
  private getIdxOfSumRule(m: TimebarMetric) {
    let i = 0;
    if (!m) {
      return -1;
    }
    for (let r of m.rules) {
      if (this.isSumRule(r)) {
        return i;
      }
      i++;
    }
    return -1;
  }

  private isSumRule(r: Rule): boolean {
    return (!r.operator) && (r.propertyType == 'int' || r.propertyType == 'float' || r.propertyType == 'edge');
  }

  private putSumRuleAtStart(m: TimebarMetric) {
    const idx = this.getIdxOfSumRule(m);
    if (idx < 1) {
      return;
    }
    const tmp = m.rules[idx];
    m.rules[idx] = m.rules[0];
    m.rules[0] = tmp;
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
    }
    this.editingIdx = -1;
    this._profile.saveTimebarMetrics(this.currMetrics);
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
