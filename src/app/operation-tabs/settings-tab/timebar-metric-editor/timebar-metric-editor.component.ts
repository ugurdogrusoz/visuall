import { Component, OnInit } from '@angular/core';
import properties from '../../../../assets/generated/properties.json';
import AppDescription from '../../../../assets/app_description.json';
import { ClassOption, TimebarMetric, Rule, RuleSync } from '../../filter-tab/filtering-types.js';
import { NEO4J_2_JS_NUMBER_OPERATORS, NEO4J_2_JS_STR_OPERATORS, GENERIC_TYPE } from '../../../constants';
import { TimebarService } from '../../../timebar.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-timebar-metric-editor',
  templateUrl: './timebar-metric-editor.component.html',
  styleUrls: ['./timebar-metric-editor.component.css']
})
export class TimebarMetricEditorComponent implements OnInit {

  classOptions: ClassOption[];
  selectedClassProps: string[];
  selectedClass: string;
  private currDatetimes: Date[];
  filteringRule: TimebarMetric;
  currMetrics: TimebarMetric[];
  currMetricName: string = 'new';
  currMetricColor: string = null;
  isAClassSelectedForMetric = false;
  private editingIdx = -1;
  private newStatBtnTxt = 'Add Statistic';
  isHideEditing = true;
  isAddingNew = false;
  isGenericTypeSelected = true;
  isSumMetric = false;
  currProperties: Subject<RuleSync> = new Subject();

  constructor(private _timeBarService: TimebarService) {
    this.classOptions = [];
    this.selectedClassProps = [];
    this.currDatetimes = [new Date()];
    this.filteringRule = null;
    let fnAv = (x) => { if ((x.classes().map(x => x.toLowerCase()).includes('movie')) && (x.data().genre === 'Comedy' && x.data().rating < 7 && x.data().rating > 5)) return 1; return 0; };
    let fnLo = (x) => { if ((x.classes().map(x => x.toLowerCase()).includes('movie')) && (x.data().genre === 'Comedy' && x.data().rating < 5)) return 1; return 0; };
    let fnHi = (x) => { if ((x.classes().map(x => x.toLowerCase()).includes('movie')) && (x.data().genre === 'Comedy' && x.data().rating > 7)) return 1; return 0; };
    const genreRule = { propertyOperand: 'genre', propertyType: 'string', rawInput: 'Comedy', inputOperand: 'Comedy', ruleOperator: 'AND', operator: '=' };
    let rulesHi = [genreRule, { propertyOperand: 'rating', propertyType: 'float', rawInput: '7', inputOperand: '7', ruleOperator: 'AND', operator: '>=' }];
    let rulesLo = [genreRule, { propertyOperand: 'rating', propertyType: 'float', rawInput: '5', inputOperand: '5', ruleOperator: 'AND', operator: '<=' }];
    this.currMetrics = [
      { incrementFn: fnLo, name: 'lowly rated comedies', className: 'Movie', rules: rulesLo, color: '#3366cc' },
      { incrementFn: fnHi, name: 'highly rated comedies', className: 'Movie', rules: rulesHi, color: '#ff9900' }];

    this.refreshTimebar();
  }

  getStyleForMetric(m: TimebarMetric) {
    if (m.isEditing) {
      return { 'background-color': '#eaeaea' };
    }
    return { 'background-color': `rgba(${m.color.slice(1, 3)}, ${m.color.slice(3, 5)}, ${m.color.slice(5, 7)}, 0.5)` }
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

  private clearInput() {
    this.filteringRule = null;
    this.currMetricName = 'new';
    this.currMetricColor = this.getRandomColor();
    this.newStatBtnTxt = 'Add Statistic';
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

  changeSelectedClass() {
    const txt = this.selectedClass;
    let isNodeClassSelected: boolean = properties.nodes.hasOwnProperty(txt);
    let isEdgeClassSelected: boolean = properties.edges.hasOwnProperty(txt);
    this.selectedClassProps.length = 0;
    this.selectedClassProps.push(GENERIC_TYPE.NOT_SELECTED);

    if (isNodeClassSelected) {
      this.selectedClassProps.push(...Object.keys(properties.nodes[txt]));
      this.selectedClassProps.push(...this.getEdgeTypesRelated(txt));
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
      this.filteringRule = this.currMetrics[i];
      this.currMetricName = this.currMetrics[i].name;
      this.currMetricColor = this.currMetrics[i].color;
      this.selectedClass = this.currMetrics[i].className;
      this.changeSelectedClass();
      this.isAClassSelectedForMetric = true;
      this.newStatBtnTxt = 'Update Statistic';
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

  private clearEditingOnRules() {
    for (let m of this.currMetrics) {
      m.isEditing = false;
    }
    this.editingIdx = -1;
  }

  addStat() {
    this.isAClassSelectedForMetric = false;
    if (!this.currMetricName || this.currMetricName.length < 2) {
      this.currMetricName = 'new';
    }
    this.filteringRule.name = this.currMetricName;
    this.filteringRule.color = this.currMetricColor;
    if (this.editingIdx != -1) {
      this.currMetrics[this.editingIdx] = this.filteringRule;
      this.currMetrics[this.editingIdx].isEditing = false;
    } else {
      this.currMetrics.push(this.filteringRule);
    }
    this.isHideEditing = true;
    this.isAddingNew = false;
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

  private setFnsForMetrics() {
    for (let m of this.currMetrics) {
      let fnStr = this.getBoolExpressionFromMetric(m);
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
      console.log('fnStr: ', fnStr);
      m.incrementFn = new Function('x', fnStr) as (x: any) => number;
    }
  }

  private getBoolExpressionFromMetric(m: TimebarMetric): string {
    let classCondition = '';
    // apply class condition
    if (m.className.toLowerCase() == GENERIC_TYPE.EDGES_CLASS.toLowerCase()) {
      classCondition = ` x.id()[0] === 'e' `;
    } else if (m.className.toLowerCase() == GENERIC_TYPE.NODES_CLASS.toLowerCase()) {
      classCondition = ` x.id()[0] === 'n' `;
    } else if (m.className.toLowerCase() == GENERIC_TYPE.ANY_CLASS.toLowerCase()) {
      classCondition = ` true `;
    } else {
      classCondition = ` x.classes().map(x => x.toLowerCase()).includes('${m.className.toLowerCase()}') `;
    }

    let propertyCondition = '';
    let prevBoolExp = '';
    for (let [i, r] of m.rules.entries()) {
      let boolExp = '';
      // apply property condition
      if (r.operator && r.inputOperand) {
        boolExp = this.getJsExpressionForMetricRule(r);
      }
      if (i > 0 && prevBoolExp.length > 0) {
        if (r.ruleOperator == 'OR') {
          propertyCondition += ' || ';
        } else {
          propertyCondition += ' && ';
        }
      }
      propertyCondition += boolExp;
      prevBoolExp = boolExp;
    }
    if (propertyCondition.length < 1) {
      return `if (${classCondition})`;
    }
    return `if ( (${classCondition}) && (${propertyCondition}))`;
  }

  private getJsExpressionForMetricRule(r: Rule) {
    if (r.propertyType == 'int' || r.propertyType == 'float' || r.propertyType == 'datetime' || r.propertyType == 'edge') {
      let op = NEO4J_2_JS_NUMBER_OPERATORS[r.operator];
      if (r.propertyType == 'datetime') {
        return `x.data().${r.propertyOperand} ${op} ${r.rawInput}`;
      }
      if (r.propertyType == 'edge') {
        return `x.connectedEdges('.${r.propertyOperand}').length ${op} ${r.inputOperand}`;
      }
      return `x.data().${r.propertyOperand} ${op} ${r.inputOperand}`;
    }
    if (r.propertyType == 'string') {
      if (r.operator === '=') {
        return `x.data().${r.propertyOperand} === '${r.inputOperand}'`;
      }
      let op = NEO4J_2_JS_STR_OPERATORS[r.operator];
      return `x.data().${r.propertyOperand}.${op}('${r.inputOperand}')`;
    }
    if (r.propertyType == 'list') {
      return `x.data().${r.propertyOperand}.includes('${r.inputOperand}')`;
    }
    if (r.propertyType.startsWith('enum')) {
      let op = NEO4J_2_JS_NUMBER_OPERATORS[r.operator];
      if (r.propertyType.endsWith('string')) {
        return `x.data().${r.propertyOperand} ${op} '${r.inputOperand}'`;
      } else {
        return `x.data().${r.propertyOperand} ${op} ${r.inputOperand}`;
      }
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
    this._timeBarService.shownMetrics = this.currMetrics;
    this._timeBarService.setColors();
    this._timeBarService.renderChart();
  }

  colorSelected(c: string) {
    this.currMetricColor = c;
  }

}
