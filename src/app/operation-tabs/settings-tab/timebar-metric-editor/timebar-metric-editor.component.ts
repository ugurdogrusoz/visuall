import { Component, OnInit } from '@angular/core';
import properties from '../../../../assets/generated/properties.json';
import ModelDescription from '../../../../model_description.json';

import { ClassOption, ClassBasedRules, Rule } from '../../filter-tab/filtering-types.js';
import {
  NUMBER_OPERATORS, TEXT_OPERATORS, LIST_OPERATORS, compareUsingOperator, findTypeOfAttribute, FILTER_CLASS_HIDE
} from '../../../constants';
import flatpickr from 'flatpickr';

@Component({
  selector: 'app-timebar-metric-editor',
  templateUrl: './timebar-metric-editor.component.html',
  styleUrls: ['./timebar-metric-editor.component.css']
})
export class TimebarMetricEditorComponent implements OnInit {

  private nodeClasses: Set<string>;
  private edgeClasses: Set<string>;
  private classOptions: ClassOption[];
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
  private filteringRule: ClassBasedRules;
  private filteredTypeCount: number;
  private isConditionalMetric: false;
  private currMetrics: ClassBasedRules[];
  private readonly NO_OPERATION = 'no_op';

  constructor() {
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
    this.currMetrics = [];
  }

  ngOnInit() {
    let opt = {
      defaultDate: new Date(),
    };
    flatpickr('#filter-date-inp0', opt);

    this.classOptions.push({ text: '─── Nodes ───', isDisabled: true });
    for (const key in properties.nodes) {
      this.classOptions.push({ text: key, isDisabled: false });
      this.nodeClasses.add(key);
      if (this.selectedClassProps.length == 0) {
        this.selectedClassProps = Object.keys(properties.nodes[key]);
      }
    }

    this.classOptions.push({ text: '─── Edges ───', isDisabled: true });
    for (const key in properties.edges) {
      this.edgeClasses.add(key);
      this.classOptions.push({ text: key, isDisabled: false });
    }

    this.selectedClass = this.classOptions[1].text;
    this.changeSelectedClass();
  }

  private changeSelectedClass() {
    const txt = this.selectedClass;
    let isNodeClassSelected: boolean = properties.nodes.hasOwnProperty(txt);
    this.selectedClassProps.length = 0;
    if (!this.isConditionalMetric) {
      this.selectedClassProps.push('-');
    }
    if (isNodeClassSelected) {
      if (this.isConditionalMetric) {
        this.selectedClassProps.push(...Object.keys(properties.nodes[txt]));
      } else {
        this.selectedClassProps.push(...this.getNumberProperties(properties.nodes[txt]));
        this.selectedClassProps.push(...this.getEdgeTypesRelated(txt));
      }
    } else {
      if (this.isConditionalMetric) {
        this.selectedClassProps.push(...Object.keys(properties.edges[txt]));
      } else {
        this.selectedClassProps.push(...this.getNumberProperties(properties.edges[txt]));
      }
    }
    this.selectedProp = this.selectedClassProps[0];

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
    this.attributeType = attrType;

    this.operators = {};
    this.operatorKeys = [];
    this.isDateProp = false;

    if (!this.isConditionalMetric) {
      this.operators[this.NO_OPERATION] = this.NO_OPERATION;
      this.operatorKeys.push(this.NO_OPERATION);
    }

    if (attrType == 'string') {
      this.addOperators(TEXT_OPERATORS);
    } else if (attrType == 'float' || attrType == 'int') {
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
    this.selectedOperatorKey = this.operatorKeys[0];
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

    if (this.isConditionalMetric && (!logicOperator || !className || !attribute || value === undefined || !operator))
      return;
    if (!this.isConditionalMetric && !className)
      return;

    const isEdge = this.edgeClasses.has(className);
    const rule: Rule = {
      propertyOperand: attribute,
      propertyType: this.attributeType,
      rawInput: value,
      inputOperand: value,
      ruleOperator: logicOperator,
      operator: operator,
    };
    this.addRule2FilteringRules(rule, isEdge, className);
  }

  private addRule2FilteringRules(r: Rule, isEdge: boolean, className: string) {
    if (r.propertyType == 'datetime') {
      r.inputOperand = new Date(r.rawInput).toLocaleString();
    }
    if (!this.isConditionalMetric) {
      this.currMetrics.push({ className: className, rules: [r], isEdge: isEdge });
      this.filteringRule = null;
    } else {
      if (!this.filteringRule) {
        this.filteringRule = { className: className, rules: [r], isEdge: isEdge };
      } else {
        if (this.filteringRule.className != className) {
          console.log('can not add multiple conditionals from different types');
          return;
        }
        this.filteringRule.rules.push(r);
      }
    }
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
    } else {
      this.filteringRule.rules.splice(j, 1);
    }
  }

  private isMetricConditional(m: ClassBasedRules): boolean {
    if (m.rules.length == 1 && m.rules[0].operator == this.NO_OPERATION) {
      return false;
    }
    return true;
  }

  private deleteMetric(i: number) {
    this.currMetrics.splice(i, 1);
  }

  private addStat() {
    this.currMetrics.push(this.filteringRule);
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

}
