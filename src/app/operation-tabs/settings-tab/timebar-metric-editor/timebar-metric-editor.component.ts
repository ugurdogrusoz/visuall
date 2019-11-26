import { Component, OnInit } from '@angular/core';
import properties from '../../../../assets/generated/properties.json';
import ModelDescription from '../../../../model_description.json';
import { iClassOption, iTimebarMetric, iMetricCondition } from '../../filter-tab/filtering-types.js';
import {
  NUMBER_OPERATORS, TEXT_OPERATORS, LIST_OPERATORS, findTypeOfAttribute, NEO4J_2_JS_NUMBER_OPERATORS, NEO4J_2_JS_STR_OPERATORS
} from '../../../constants';
import flatpickr from 'flatpickr';
import { TimebarService } from '../../../timebar.service';

@Component({
  selector: 'app-timebar-metric-editor',
  templateUrl: './timebar-metric-editor.component.html',
  styleUrls: ['./timebar-metric-editor.component.css']
})
export class TimebarMetricEditorComponent implements OnInit {

  private nodeClasses: Set<string>;
  private edgeClasses: Set<string>;
  classOptions: iClassOption[];
  selectedClassProps: string[];
  selectedClass: string;
  selectedProp: string;
  filterInp: string;
  private operators: any;
  private attributeType: string;
  operatorKeys: string[];
  isDateProp: boolean;
  selectedOperatorKey: string;
  private currDatetimes: Date[];
  filteringRule: iTimebarMetric;
  private filteredTypeCount: number;
  currMetrics: iTimebarMetric[];
  currMetricName: string = 'untitled';
  currMetricColor: string = null;
  private readonly NO_OPERATION = 'no_op';
  private readonly ANY_CLASS = 'Any Object';
  private readonly NOT_SELECTED = '───';
  private readonly NODES_CLASS = 'Any Node';
  private readonly EDGES_CLASS = 'Any Edge';
  isAClassSelectedForMetric = false;
  private editingIdx = -1;
  private newStatBtnTxt = 'Add Statistic';
  isHideEditing = true;
  isAddingNew = false;
  isGenericTypeSelected = true;
  isSumMetric = false;

  constructor(private _timeBarService: TimebarService) {
    this.nodeClasses = new Set([]);
    this.edgeClasses = new Set([]);
    this.classOptions = [];
    this.operators = {};
    this.operatorKeys = [];
    this.selectedClassProps = [];
    this.isDateProp = false;
    this.currDatetimes = [new Date()];
    this.filteredTypeCount = 0;
    this.filteringRule = null;
    this.currMetrics = [{ incrementFn: (x) => { if (x.id()[0] === 'n') return 1; return 0 }, name: '# of nodes', className: this.NODES_CLASS, rules: [], color: '#3366cc' },
    { incrementFn: (x) => { if (x.id()[0] === 'e') return 1; return 0 }, name: '# of edges', className: this.EDGES_CLASS, rules: [], color: '#dc3912' },
    { incrementFn: (x) => { return 1; }, name: '# of nodes + # of edges', className: this.ANY_CLASS, rules: [], color: '#ff9900' }];

    this.refreshTimebar();
  }

  ngOnInit() {
    let opt = {
      defaultDate: new Date(),
    };
    flatpickr('#filter-date-inp0', opt);

    this.classOptions.push({ text: this.ANY_CLASS, isDisabled: false });
    this.classOptions.push({ text: this.NODES_CLASS, isDisabled: false });
    for (const key in properties.nodes) {
      this.classOptions.push({ text: key, isDisabled: false });
      this.nodeClasses.add(key);
      if (this.selectedClassProps.length == 0) {
        this.selectedClassProps = Object.keys(properties.nodes[key]);
      }
    }

    this.classOptions.push({ text: this.EDGES_CLASS, isDisabled: false });
    for (const key in properties.edges) {
      this.edgeClasses.add(key);
      this.classOptions.push({ text: key, isDisabled: false });
    }

    this.clearInput();
  }

  private clearInput() {
    this.filteringRule = null;
    this.currMetricName = 'untitled';
    this.currMetricColor = this.getRandomColor();
    this.filterInp = '';
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
    this.selectedClassProps.push(this.NOT_SELECTED);

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
    this.selectedProp = null;
    this.selectedOperatorKey = null;
    this.changeSelectedProp();
  }

  private getNumberProperties(obj): string[] {
    let r: string[] = [];
    for (let k of Object.keys(obj)) {
      if (obj[k] == 'int' || obj[k] == 'float') {
        r.push(k);
      }
    }
    return r;
  }

  changeSelectedProp() {
    let attrType = findTypeOfAttribute(this.selectedProp, properties.nodes, properties.edges);
    if (this.edgeClasses.has(this.selectedProp)) {
      attrType = 'edge';
    }
    this.attributeType = attrType;
    this.operators = {};
    this.operatorKeys = [];
    this.isDateProp = false;

    this.operators[this.NO_OPERATION] = this.NO_OPERATION;
    this.operatorKeys.push(this.NOT_SELECTED);

    if (attrType == 'string') {
      this.addOperators(TEXT_OPERATORS);
    } else if (attrType == 'float' || attrType == 'int' || attrType == 'edge') {
      this.addOperators(NUMBER_OPERATORS);
    } else if (attrType == 'list') {
      this.addOperators(LIST_OPERATORS);
    } else if (attrType == 'datetime') {
      this.addOperators(NUMBER_OPERATORS);
      this.isDateProp = true;
      let opt = {
        defaultDate: new Date(),
      };
      flatpickr('#filter-date-inp0', opt);
    }
  }

  private addOperators(op) {
    for (let [k, v] of Object.entries(op)) {
      this.operators[k] = v;
      this.operatorKeys.push(k);
    }
  }

  onAddRuleClick() {
    const logicOperator = 'OR';
    const className = this.selectedClass;
    const attribute = this.selectedProp;
    let value: any = this.filterInp;

    let operator = this.operators[this.selectedOperatorKey];
    const attributeType = this.attributeType;
    if (attributeType == 'datetime') {
      value = document.querySelector('#filter-date-inp0')['_flatpickr'].selectedDates[0].getTime();
    } else if (attributeType == 'int') {
      value = parseInt(value);
    } else if (attributeType == 'float') {
      value = parseFloat(value);
    }

    const isEdge = this.edgeClasses.has(className);
    const rule: iMetricCondition = {
      propertyOperand: attribute,
      propertyType: this.attributeType,
      rawInput: value,
      inputOperand: value,
      ruleOperator: logicOperator,
      operator: operator,
    };
    this.addRule2FilteringRules(rule, isEdge, className);
  }

  private addRule2FilteringRules(r: iMetricCondition, isEdge: boolean, className: string) {
    if (r.propertyType == 'datetime') {
      r.inputOperand = new Date(r.rawInput).toLocaleString();
    }
    if (!this.filteringRule) {
      if (!this.currMetricName) {
        this.currMetricName = '';
      }
      this.filteringRule = { rules: [], name: this.currMetricName, incrementFn: null, isEdge: isEdge, className: className, color: this.currMetricColor };
    } else {
      this.filteringRule.name = this.currMetricName;
      this.filteringRule.color = this.currMetricColor;
    }
    if (r.propertyOperand && r.propertyOperand.length > 0 && r.propertyOperand != this.NOT_SELECTED) {
      this.filteringRule.rules.push(r);
    }
    this.putSumRuleAtStart(this.filteringRule);
    this.isAClassSelectedForMetric = true;
    this.isSumMetric = this.getIdxOfSumRule(this.filteringRule) > -1;
  }

  private getEdgeTypesRelated(nodeType: string): string[] {
    let r: string[] = [];

    const txt = this.selectedClass.toLowerCase();
    for (let k of Object.keys(ModelDescription.relations)) {
      const v = ModelDescription.relations[k];
      if (v.source.toLowerCase() == txt || v.target.toLowerCase() == txt) {
        r.push(k);
      }
    }
    return r;
  }

  private deleteFilterRule(j: number) {
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

  private deleteMetric(i: number) {
    if (this.currMetrics.length < 2) {
      return;
    }
    this.currMetrics.splice(i, 1);
    if (this.editingIdx == i) {
      this.clearInput();
    }
    this.refreshTimebar();
  }

  private editMetric(i: number) {

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

  private addStat() {
    this.isAClassSelectedForMetric = false;
    if (!this.currMetricName || this.currMetricName.length < 2) {
      this.currMetricName = 'untitled';
    }
    this.filteringRule.name = this.currMetricName;
    this.filteringRule.color = this.currMetricColor;
    if (this.editingIdx != -1) {
      this.currMetrics[this.editingIdx] = this.filteringRule;
      this.currMetrics[this.editingIdx].isEditing = false;
      this.isHideEditing = true;
    } else {
      this.currMetrics.push(this.filteringRule);
    }
    this.setFnsForMetrics();
    this.refreshTimebar();
    this.clearInput();
  }

  private changeFilterRuleOrder(j: number, isUp: boolean) {
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

  private ruleOperatorClicked(j: number, op: string) {
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
          let s = r.propertyOperand.toUpperCase();
          fnStr += `return x.connectedEdges('.${s}').length;`
        } else {
          fnStr += `return x.data().${r.propertyOperand};`
        }
      }
      fnStr += ' return 0;'
      console.log('fnStr: ', fnStr);
      m.incrementFn = new Function('x', fnStr) as (x: any) => number;
    }
  }

  private getBoolExpressionFromMetric(m: iTimebarMetric): string {
    let classCondition = '';
    // apply class condition
    if (m.className.toLowerCase() == this.EDGES_CLASS.toLowerCase()) {
      classCondition = ` x.id()[0] === 'e' `;
    } else if (m.className.toLowerCase() == this.NODES_CLASS.toLowerCase()) {
      classCondition = ` x.id()[0] === 'n' `;
    } else if (m.className.toLowerCase() == this.ANY_CLASS.toLowerCase()) {
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

  private getJsExpressionForMetricRule(r: iMetricCondition) {
    if (r.propertyType == 'int' || r.propertyType == 'float' || r.propertyType == 'datetime' || r.propertyType == 'edge') {
      let op = NEO4J_2_JS_NUMBER_OPERATORS[r.operator];
      if (r.propertyType == 'datetime') {
        return `x.data().${r.propertyOperand} ${op} ${r.rawInput}`;
      }
      if (r.propertyType == 'edge') {
        return `x.connectedEdges('.${r.propertyOperand.toUpperCase()}').length ${op} ${r.inputOperand}`;
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
  }

  // if there is 1 sum rule it is a Sum metric (otherwise count metric)
  private getIdxOfSumRule(m: iTimebarMetric) {
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

  private isSumRule(r: iMetricCondition): boolean {
    return (!r.operator) && (r.propertyType == 'int' || r.propertyType == 'float' || r.propertyType == 'edge');
  }

  private putSumRuleAtStart(m: iTimebarMetric) {
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
    console.log('color: ', c);
    this.currMetricColor = c;
  }

}
