import { Component, OnInit, Output, EventEmitter, Input, ViewChild, ElementRef } from '@angular/core';
import { findTypeOfAttribute, TEXT_OPERATORS, NUMBER_OPERATORS, LIST_OPERATORS, ENUM_OPERATORS, GENERIC_TYPE, isNumber } from '../constants';
import flatpickr from 'flatpickr';
import { PropertyCategory, Rule, RuleSync } from '../operation-tabs/filter-tab/filtering-types';
import properties from '../../assets/generated/properties.json';
import ModelDescription from '../../assets/model_description.json';
import { Subject } from 'rxjs';
import { ErrorModalComponent } from '../popups/error-modal/error-modal.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

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
  currInpType: string = 'text';
  @Input() propertyChanged: Subject<RuleSync>;
  @Input() isStrict: boolean;
  @Output() onRuleReady = new EventEmitter<Rule>();
  @ViewChild('dateInp', { static: false }) dateInp: ElementRef;

  constructor(private _modalService: NgbModal) { }

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
      this.currInpType = 'text';
      this.addOperators(TEXT_OPERATORS);
    } else if (attrType == 'float' || attrType == 'int' || attrType == 'edge') {
      this.currInpType = 'number';
      this.addOperators(NUMBER_OPERATORS);
    } else if (attrType == 'list') {
      this.addOperators(LIST_OPERATORS);
      this.currInpType = 'text';
    } else if (attrType.startsWith('enum')) {
      this.addOperators(ENUM_OPERATORS);
    } else if (attrType == 'datetime') {
      this.addOperators(NUMBER_OPERATORS);
      let opt = {
        defaultDate: new Date(), enableTime: true, enableSeconds: true, time_24hr: true,
      };

      flatpickr(this.dateInp.nativeElement, opt);
    }
  }

  onAddRuleClick() {
    const logicOperator = 'OR';
    const attribute = this.selectedProp;
    let value: any = this.filterInp;
    let rawValue: any = this.filterInp;
    let category: PropertyCategory = PropertyCategory.other;

    let operator = this.operators[this.selectedOperatorKey];
    let atType = this.attributeType;
    if (atType && atType.startsWith('enum')) {
      atType = atType.substr(atType.indexOf(',') + 1);
    }

    if (atType == 'datetime') {
      value = this.dateInp.nativeElement['_flatpickr'].selectedDates[0].getTime();
      rawValue = value;
      category = PropertyCategory.date;
    } else if (atType == 'int') {
      value = parseInt(value);
    } else if (atType == 'float') {
      value = parseFloat(value);
    }

    const rule: Rule = {
      propertyOperand: attribute,
      propertyType: atType,
      rawInput: rawValue,
      inputOperand: value,
      ruleOperator: logicOperator,
      operator: operator
    };
    const isOk = this.isStrictlyValid(rule);
    if (this.isStrict && !isOk) {
      this._modalService.open(ErrorModalComponent);
      return;
    }
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

  private isStrictlyValid(rule: Rule) {
    const p = rule.propertyOperand;
    // property not selected, so only a class is selected 
    if (p == null || p == GENERIC_TYPE.NOT_SELECTED) {
      return true;
    }
    const op = rule.operator;
    // property is selected so an operator must be selected
    if (op === undefined || op === null) {
      return false;
    }
    const inp = rule.inputOperand;
    // property, operator are selected so an input must be provided
    if (inp === undefined || inp === null) {
      return false;
    }
    const t = rule.propertyType;
    if ((t == 'datetime' || t == 'float' || t == 'int') && !isNumber(inp)) {
      return false;
    }
    return true;
  }

}
