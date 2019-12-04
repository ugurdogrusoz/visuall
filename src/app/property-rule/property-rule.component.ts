import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { findTypeOfAttribute, TEXT_OPERATORS, NUMBER_OPERATORS, LIST_OPERATORS, ENUM_OPERATORS } from '../constants';
import flatpickr from 'flatpickr';
import { PropertyCategory, iRule, iRuleSync } from '../operation-tabs/filter-tab/filtering-types';
import properties from '../../assets/generated/properties.json';
import ModelDescription from '../../model_description.json';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-property-rule',
  templateUrl: './property-rule.component.html',
  styleUrls: ['./property-rule.component.css']
})
export class PropertyRuleComponent implements OnInit {
  private attributeType: string;
  private readonly NO_OPERATION = 'no_op';
  private operators: any;
  private readonly NOT_SELECTED = '───';

  selectedProp: string;
  isGenericTypeSelected = true;
  selectedClassProps: string[];
  selectedOperatorKey: string;
  operatorKeys: string[];
  selectedPropertyCategory: PropertyCategory;
  filterInp: string;
  finiteSetPropertyMap: any = null;
  selectedClass: string;
  @Input() propertyChanged: Subject<iRuleSync>;
  @Output() onRuleReady = new EventEmitter<iRule>();

  constructor() { }

  ngOnInit() {
    this.propertyChanged.subscribe(v => {
      this.propertiesChanged(v.properties, v.isGenericTypeSelected, v.selectedClass);
    });
  }

  propertiesChanged(properties: string[], isGenericTypeSelected: boolean, selectedClass: string) {
    this.selectedClassProps = properties;
    this.isGenericTypeSelected = isGenericTypeSelected;
    this.selectedClass = selectedClass;
    this.filterInp = '';
    this.selectedProp = null;
    this.selectedOperatorKey = null;
    this.changeSelectedProp();
  }

  changeSelectedProp() {
    let attrType = findTypeOfAttribute(this.selectedProp, properties.nodes, properties.edges);
    if (properties.edges[this.selectedProp]) {
      attrType = 'edge';
    }
    this.attributeType = attrType;
    this.operators = {};
    this.operatorKeys = [];
    this.selectedPropertyCategory = this.getPropertyCategory();

    this.operators[this.NO_OPERATION] = this.NO_OPERATION;
    this.operatorKeys.push(this.NOT_SELECTED);
    if (!attrType) {
      return;
    }
    if (attrType == 'string') {
      this.addOperators(TEXT_OPERATORS);
    } else if (attrType == 'float' || attrType == 'int' || attrType == 'edge') {
      this.addOperators(NUMBER_OPERATORS);
    } else if (attrType == 'list') {
      this.addOperators(LIST_OPERATORS);
    } else if (attrType.startsWith('enum')) {
      this.addOperators(ENUM_OPERATORS);
    } else if (attrType == 'datetime') {
      this.addOperators(NUMBER_OPERATORS);
      let opt = {
        defaultDate: new Date(),
      };
      flatpickr('#filter-date-inp0', opt);
    }
  }

  onAddRuleClick() {
    const logicOperator = 'OR';
    const attribute = this.selectedProp;
    let value: any = this.filterInp;
    let rawValue: any = this.filterInp;
    let category: PropertyCategory = PropertyCategory.other;

    let operator = this.operators[this.selectedOperatorKey];
    const attributeType = this.attributeType;
    if (attributeType == 'datetime') {
      value = document.querySelector('#filter-date-inp0')['_flatpickr'].selectedDates[0].getTime();
      rawValue = value;
      category = PropertyCategory.date;
    } else if (attributeType == 'int') {
      value = parseInt(value);
    } else if (attributeType == 'float') {
      value = parseFloat(value);
    } else if (attributeType && attributeType.startsWith('enum')) {
      rawValue = this.finiteSetPropertyMap[value];
      category = PropertyCategory.finiteSet;
    }

    const rule: iRule = {
      propertyOperand: attribute,
      propertyType: this.attributeType,
      rawInput: rawValue,
      inputOperand: value,
      ruleOperator: logicOperator,
      operator: operator,
      category: category
    };
    this.onRuleReady.emit(rule);
  }

  private addOperators(op) {
    for (let [k, v] of Object.entries(op)) {
      this.operators[k] = v;
      this.operatorKeys.push(k);
    }
  }

  private getPropertyCategory(): PropertyCategory {
    let m = ModelDescription.finiteSetPropertyMapping;
    this.finiteSetPropertyMap = null;
    if (m && m[this.selectedClass] && m[this.selectedClass][this.selectedProp]) {
      this.finiteSetPropertyMap = m[this.selectedClass][this.selectedProp];
      return PropertyCategory.finiteSet;
    }
    if (this.attributeType == 'datetime') {
      return PropertyCategory.date;
    }
    return PropertyCategory.other;
  }

}
