import { Component, OnInit, Output, EventEmitter, Input, ViewChild, ElementRef, HostListener } from '@angular/core';
import { TEXT_OPERATORS, NUMBER_OPERATORS, LIST_OPERATORS, ENUM_OPERATORS, GENERIC_TYPE, isNumber, DATETIME_OPERATORS } from '../constants';
import flatpickr from 'flatpickr';
import { PropertyCategory, Rule, RuleSync } from '../operation-tabs/map-tab/query-types';
import { Subject } from 'rxjs';
import { ErrorModalComponent } from '../popups/error-modal/error-modal.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { IPosition } from 'angular2-draggable';
import { GlobalVariableService } from '../global-variable.service';

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
  @Input() loadRule: Rule;
  @Input() isStrict: boolean;
  @Input() refreshView: Subject<boolean>;
  @Output() onRuleReady = new EventEmitter<Rule>();
  @ViewChild('dateInp', { static: false }) dateInp: ElementRef;
  isShowTxtArea = false;
  txtAreaSize: { width: number, height: number } = { width: 250, height: 150 };
  position: IPosition = { x: 0, y: 0 };

  constructor(private _modalService: NgbModal, private _g: GlobalVariableService) { }

  ngOnInit() {
    this.propertyChanged.subscribe(x => { this.updateView(x.properties, x.isGenericTypeSelected, x.selectedClass) });
  }

  updateView(props: string[], isGeneric: boolean, cName: string) {
    this.selectedClassProps = props;
    this.isGenericTypeSelected = isGeneric;
    this.selectedClass = cName;
    this.filterInp = '';
    this.selectedProp = null;
    this.selectedOperatorKey = null;

    if (this.loadRule) {
      this.filterInp = this.loadRule.inputOperand;
      this.selectedProp = this.loadRule.propertyOperand;
      // will set the operators according to selected property
      this.changeSelectedProp(this.filterInp, this.loadRule.rawInput);
      for (const opKey in this.operators) {
        if (this.operators[opKey] == this.loadRule.operator) {
          this.selectedOperatorKey = opKey;
        }
      }
    } else {
      this.changeSelectedProp();
    }
  }

  changeSelectedProp(filterInp = '', unixDateValue = null) {
    const model = this._g.dataModel.getValue();
    this.textAreaInp = '';
    this.filterInp = filterInp;
    let attrType = undefined;
    if (model.nodes[this.selectedClass]) {
      attrType = model.nodes[this.selectedClass][this.selectedProp];
    } else if (model.edges[this.selectedClass]) {
      attrType = model.edges[this.selectedClass][this.selectedProp];
    }
    if (model.edges[this.selectedProp]) {
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
        minDate: this._g.userPrefs.dbQueryTimeRange.start.getValue(),
        maxDate: this._g.userPrefs.dbQueryTimeRange.end.getValue(),
      };
      if (unixDateValue) {
        opt.defaultDate = new Date(unixDateValue);
      }

      // view child gives undefined 
      setTimeout(() => {
        flatpickr(this.dateInp.nativeElement, opt);
      }, 0);
    }
  }

  @HostListener('document:keydown.enter', ['$event'])
  onAddRuleClick() {
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

    let mapped = undefined;
    if (this.finiteSetPropertyMap) {
      const o = this.finiteSetPropertyMap.find(x => x.key == this.filterInp);
      if (o) {
        mapped = o.value;
      }
    }
    const rule: Rule = {
      propertyOperand: attribute,
      propertyType: atType,
      rawInput: rawValue,
      inputOperand: value,
      ruleOperator: null,
      operator: operator,
      enumMapping: mapped
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

  private addOperators(op) {
    for (let [k, v] of Object.entries(op)) {
      this.operators[k] = v;
      this.operatorKeys.push(k);
    }
  }

  private getPropertyCategory(): PropertyCategory {
    let m = this._g.getEnumMapping();
    this.finiteSetPropertyMap = null;
    if (m && m[this.selectedClass] && m[this.selectedClass][this.selectedProp]) {
      this.finiteSetPropertyMap = m[this.selectedClass][this.selectedProp];
      const arr = [];
      for (const k in this.finiteSetPropertyMap) {
        arr.push({ key: k, value: this.finiteSetPropertyMap[k] });
      }
      arr.sort((a: any, b: any) => { if (a.value > b.value) return 1; if (b.value > a.value) return -1; return 0 });
      this.finiteSetPropertyMap = arr;
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


}
