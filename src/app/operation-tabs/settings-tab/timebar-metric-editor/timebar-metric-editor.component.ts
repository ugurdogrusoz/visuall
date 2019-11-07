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
  private filteringRules: ClassBasedRules[];
  private filteredTypeCount: number;
  private isConditionalMetric: false;
  private currentMetrics: ClassBasedRules[];
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
    this.filteringRules = [];
    this.currentMetrics = [];
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
    let idx: number = this.filteringRules.findIndex(x => x.className == className);
    if (r.propertyType == 'datetime') {
      r.inputOperand = new Date(r.rawInput).toLocaleString();
    }
    if (idx == -1) {
      if (this.isConditionalMetric) {
        this.filteringRules.push({ className: className, rules: [r], isEdge: isEdge });
      } else {
        this.currentMetrics.push({ className: className, rules: [r], isEdge: isEdge });
      }
    } else {
      this.filteringRules[idx].rules.push(r);
    }

    if (!this.isConditionalMetric) {
      this.filteringRules.pop();
    }
    console.log('this.currentMetrics: ', this.currentMetrics.map(x => x.rules[0]));
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

  private deleteFilterRule(i: number, j: number) {
    if (this.filteringRules[i].rules.length == 1) {
      this.filteringRules.splice(i, 1);
    } else {
      this.filteringRules[i].rules.splice(j, 1);
    }
  }

  private isMetricConditional(m: ClassBasedRules): boolean {
    if (m.rules.length == 1 && m.rules[0].operator == this.NO_OPERATION) {
      return false;
    }
    return true;
  }

}
