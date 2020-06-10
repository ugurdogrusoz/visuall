import { Component, OnInit, Output, EventEmitter, Input, ViewChild, ElementRef } from '@angular/core';
import { TEXT_OPERATORS, NUMBER_OPERATORS, LIST_OPERATORS, ENUM_OPERATORS, GENERIC_TYPE, isNumber, DATETIME_OPERATORS } from '../constants';
import flatpickr from 'flatpickr';
import { PropertyCategory, Rule, RuleSync } from '../operation-tabs/map-tab/query-types';
import properties from '../../assets/generated/properties.json';
import AppDescription from '../../assets/app_description.json';
import { Subject } from 'rxjs';
import { ErrorModalComponent } from '../popups/error-modal/error-modal.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { IPosition } from 'angular2-draggable';

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
  textAreaInp: string = '';
  finiteSetPropertyMap: any = null;
  selectedClass: string;
  currInpType: string = 'text';
  @Input() propertyChanged: Subject<RuleSync>;
  @Input() isStrict: boolean;
  @Output() onRuleReady = new EventEmitter<Rule>();
  @ViewChild('dateInp', { static: false }) dateInp: ElementRef;
  isShowTxtArea = false;
  txtAreaSize: { width: number, height: number } = { width: 250, height: 150 };
  position: IPosition = { x: 0, y: 0 };

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
    this.textAreaInp = '';
    this.filterInp = '';
    let attrType = undefined;
    if (properties.nodes[this.selectedClass]) {
      attrType = properties.nodes[this.selectedClass][this.selectedProp];
    } else if (properties.edges[this.selectedClass]) {
      attrType = properties.edges[this.selectedClass][this.selectedProp];
    }
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
      this.addOperators(DATETIME_OPERATORS);
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

    let operator = this.operators[this.selectedOperatorKey];
    let atType = this.attributeType;
    if (atType && atType.startsWith('enum')) {
      atType = atType.substr(atType.indexOf(',') + 1);
    }

    if (atType == 'datetime') {
      value = this.dateInp.nativeElement['_flatpickr'].selectedDates[0].getTime();
      rawValue = value;
    } else if (atType == 'int') {
      value = parseInt(value);
    } else if (atType == 'float') {
      value = parseFloat(value);
    }

    if (this.selectedOperatorKey == 'one of') {
      value = this.filterInp;
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
      const instance = this._modalService.open(ErrorModalComponent);
      instance.componentInstance.msg = 'Invalid Rule!';
      instance.componentInstance.title = 'Error';
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
    let m = AppDescription.enumMapping;
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
    if ((t == 'datetime' || t == 'float' || t == 'int') && !isNumber(inp) && this.selectedOperatorKey != 'one of') {
      return false;
    }
    return true;
  }

  filterInpClicked() {
    if (this.selectedOperatorKey != 'one of') {
      return;
    }
    if (this.position.x == 0 && this.position.y == 0) {
      this.position = { x: -130, y: 0 };
    }
    this.isShowTxtArea = true;
    this.currInpType = 'text';
  }

  txtAreaPopupOk() {
    this.filterInp = this.textAreaInp.trim().split('\n').join(',');
    this.isShowTxtArea = false;
  }

  txtAreaPopupCancel() {
    this.textAreaInp = this.filterInp.split(',').join('\n');
    this.isShowTxtArea = false;
  }

  onMoveEnd(e) {
    this.position = e;
  }

  onResizeStop(e) {
    this.txtAreaSize = e.size;
  }
}
