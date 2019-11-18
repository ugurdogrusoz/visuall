import { Component, OnInit } from '@angular/core';
import properties from '../../../../assets/generated/properties.json';
import ModelDescription from '../../../../model_description.json';
import { iClassOption, iTimebarMetric, iMetricCondition } from '../../filter-tab/filtering-types.js';
import {
  NUMBER_OPERATORS, TEXT_OPERATORS, LIST_OPERATORS, compareUsingOperator, findTypeOfAttribute, FILTER_CLASS_HIDE, NEO4J_2_JS_NUMBER_OPERATORS, NEO4J_2_JS_STR_OPERATORS
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
  private classOptions: iClassOption[];
  private selectedClassProps: string[];
  private selectedClass: string;
  private selectedProp: string;
  private filterInp: string;
  private operators: any;
  private attributeType: string;
  private operatorKeys: string[];
  private isDateProp: boolean;
  private selectedOperatorKey: string;
  private currDatetimes: Date[];
  private filteringRule: iTimebarMetric;
  private filteredTypeCount: number;
  private currMetrics: iTimebarMetric[];
  private currMetricName: string;
  private readonly NO_OPERATION = 'no_op';
  private readonly NOT_SELECTED = '─────────────';
  private readonly NODES_CLASS = '─── Nodes ───';
  private readonly EDGES_CLASS = '─── Edges ───';
  private isAClassSelectedForMetric = false;

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
    this.currMetrics = [{ incrementFn: (x) => { if (x.id()[0] === 'n') return 1; return 0 }, name: '# of nodes', rules: [{ className: this.NODES_CLASS }] },
    { incrementFn: (x) => { if (x.id()[0] === 'e') return 1; return 0 }, name: '# of edges', rules: [{ className: this.EDGES_CLASS }] },
    { incrementFn: (x) => { return 1; }, name: '# of nodes + # of edges', rules: [{ className: this.NOT_SELECTED }] }];

    this.refreshTimebar();
  }

  ngOnInit() {
    let opt = {
      defaultDate: new Date(),
    };
    flatpickr('#filter-date-inp0', opt);

    this.classOptions.push({ text: this.NOT_SELECTED, isDisabled: false });
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

    this.selectedClass = this.classOptions[0].text;
    this.changeSelectedClass();
  }

  private changeSelectedClass() {
    const txt = this.selectedClass;
    let isNodeClassSelected: boolean = properties.nodes.hasOwnProperty(txt);
    let isEdgeClassSelected: boolean = properties.edges.hasOwnProperty(txt);
    this.selectedClassProps.length = 0;
    this.selectedClassProps.push(this.NOT_SELECTED);

    if (isNodeClassSelected) {
      this.selectedClassProps.push(...Object.keys(properties.nodes[txt]));
      this.selectedClassProps.push(...this.getEdgeTypesRelated(txt));
    } else if (isEdgeClassSelected) {
      this.selectedClassProps.push(...Object.keys(properties.edges[txt]));
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

  private changeSelectedProp() {
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

  private onAddRuleClick() {
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
      isEdge: isEdge,
      className: className,
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
      this.filteringRule = { rules: [r], name: this.currMetricName, incrementFn: null };
    } else {
      this.filteringRule.name = this.currMetricName;
      this.filteringRule.rules.push(r);
    }
    this.isAClassSelectedForMetric = true;
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
      this.isAClassSelectedForMetric = false;
    } else {
      this.filteringRule.rules.splice(j, 1);
    }
  }

  private deleteMetric(i: number) {
    this.currMetrics.splice(i, 1);
    this.refreshTimebar();
  }

  private addStat() {
    this.isAClassSelectedForMetric = false;
    this.currMetrics.push(this.filteringRule);
    this.setFnsForMetrics();
    this.refreshTimebar();
    this.filteringRule = null;
  }

  private changeFilterRuleOrder(j: number, isUp: boolean) {
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

  private ruleOperatorClicked(j: number, op: string) {
    if (op == 'OR') {
      this.filteringRule.rules[j].ruleOperator = 'AND';
    } else {
      this.filteringRule.rules[j].ruleOperator = 'OR';
    }
  }

  private setFnsForMetrics() {
    for (let m of this.currMetrics) {
      let fnStr = '';
      let condition = '';
      let classCondition = '';
      let propertyCondition = '';
      let ruleCnt = 0;
      for (let r of m.rules) {
        // apply class condition
        if (r.className.toLowerCase() == this.EDGES_CLASS.toLowerCase()) {
          classCondition = ` x.id()[0] === 'e' `;
        } else if (r.className.toLowerCase() == this.NODES_CLASS.toLowerCase()) {
          classCondition = ` x.id()[0] === 'n' `;
        } else if (r.className.toLowerCase() == this.NOT_SELECTED.toLowerCase()) {
          classCondition = ``;
        } else {
          classCondition = ` x.classes().map(x => x.toLowerCase()).includes('${r.className.toLowerCase()}') `;
        }
        // apply property condition
        if (!r.propertyOperand || r.propertyOperand == this.NOT_SELECTED) {
          propertyCondition = '';
        } else if (r.operator && r.inputOperand) {
          propertyCondition = this.getJsExpressionForMetricRule(r);
        }
        // construct condition
        if (classCondition.length < 1 && propertyCondition.length < 1) {
          condition = '(true)';
        } else if (classCondition.length < 1) {
          condition = `(${propertyCondition})`;
        } else if (propertyCondition.length < 1) {
          condition = `(${classCondition})`;
        } else {
          condition = `(${classCondition} && ${propertyCondition})`;
        }
        ruleCnt++;
        // if the first condition
        if (ruleCnt == 1) {
          fnStr += `if(${condition}`
        }
        // if greater than first 
        if (ruleCnt > 1) {
          fnStr += `&& ${condition}`
        }
      }
      const idxOfSumRule = this.getIdxOfSumRule(m);
      if (idxOfSumRule == -1) {
        fnStr += `) return 1;`
      } else {
        const r = m.rules[idxOfSumRule];
        if (r.propertyType == 'edge') {
          let s = r.propertyOperand.toUpperCase();
          fnStr += `) return x.connectedEdges('.${s}').length;`
        } else {
          fnStr += `) return x.data().${r.propertyOperand};`
        }
      }
      fnStr += ' else return 0;'
      console.log('fnStr: ', fnStr);
      m.incrementFn = new Function('x', fnStr) as (x: any) => number;
    }
    this.refreshTimebar();
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
    for (let r of m.rules) {
      if ((!r.operator) && (r.propertyType == 'int' || r.propertyType == 'float' || r.propertyType == 'edge')) {
        return i;
      }

      i++;
    }
    return -1;
  }

  private refreshTimebar() {
    this._timeBarService.shownMetrics = this.currMetrics;
    this._timeBarService.renderChart();
  }

}
