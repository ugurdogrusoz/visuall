import { Component, OnInit } from '@angular/core';
import properties from '../../../assets/generated/properties.json';
import {
  NUMBER_OPERATORS, TEXT_OPERATORS, LIST_OPERATORS, COMPARE_FUNCTIONS, findTypeOfAttribute, FILTER_CLASS_HIDE
} from '../../constants';
import * as $ from 'jquery';
import { DbService } from '../../db.service';
import { CytoscapeService } from '../../cytoscape.service';
import { GlobalVariableService } from '../../global-variable.service';
import { TimebarService } from '../../timebar.service';
import flatpickr from 'flatpickr';


@Component({
  selector: 'app-filter-tab',
  templateUrl: './filter-tab.component.html',
  styleUrls: ['./filter-tab.component.css']
})
export class FilterTabComponent implements OnInit {
  nodeClasses: Set<string>;
  edgeClasses: Set<string>;
  classOptions: ClassOption[];
  selectedClassProps: string[];
  selectedClass: string;
  selectedProp: string;
  filterInp: string;
  operators: any;
  attributeType: string;
  operatorKeys: string[];
  isDateProp: boolean;
  selectedOperatorKey: string;
  currDatetimes: Date[];
  ruleCount: number;
  filteringParams: any;
  filteringRules: ClassBasedRules[];
  allFilteringRules: any;
  filteredTypeCount: number;
  isFilterOnDb: boolean;
  isMergeQueryResults: boolean;

  constructor(private _cyService: CytoscapeService, private _g: GlobalVariableService, private _dbService: DbService, private _timebarService: TimebarService) {
    this.isFilterOnDb = true;
    this.isMergeQueryResults = true;
    this.nodeClasses = new Set([]);
    this.edgeClasses = new Set([]);
    this.classOptions = [];
    this.operators = {};
    this.operatorKeys = [];
    this.selectedClassProps = [];
    this.isDateProp = false;
    this.currDatetimes = [new Date()];
    this.ruleCount = 0;
    this.filteredTypeCount = 0;
    this.filteringParams = {};
    this.allFilteringRules = {};
    this.filteringRules = [];
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

  ruleOperatorClicked(i:number, j:number, op: string) {
    if (op == 'OR') {
      this.filteringRules[i].rules[j].ruleOperator = 'AND';
    } else {
      this.filteringRules[i].rules[j].ruleOperator = 'OR';
    }
  }

  changeSelectedClass() {
    const txt = this.selectedClass;
    let isNodeClassSelected: boolean = properties.nodes.hasOwnProperty(txt);
    if (isNodeClassSelected) {
      this.selectedClassProps = Object.keys(properties.nodes[txt]);
    } else {
      this.selectedClassProps = Object.keys(properties.edges[txt]);
    }
    this.selectedProp = this.selectedClassProps[0];
    this.changeSelectedProp();
  }

  changeSelectedProp() {
    let attrType = findTypeOfAttribute(this.selectedProp, properties.nodes, properties.edges);
    this.attributeType = attrType;

    this.operators = {};
    this.operatorKeys = [];
    this.isDateProp = false;

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

  addOperators(op) {
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
    let renderedOperator = this.selectedOperatorKey;
    const attributeType = this.attributeType;
    if (attributeType === 'datetime') {
      // value = this.currDatetimes[0].getTime();
      value = document.querySelector('#filter-date-inp0')['_flatpickr'].selectedDates[0].getTime();
    }

    if (!logicOperator || !className || !attribute || !value || !operator)
      return;

    this.ruleCount++;
    const isNode = this.nodeClasses.has(className);
    const rule = {
      attribute: attribute,
      attributeType: this.attributeType,
      className: className,
      value: value,
      logicOperator: logicOperator,
      operator: operator,
      renderedOperator: renderedOperator,
      type: isNode ? 'node' : 'edge',
      id: this.ruleCount
    };
    this.createFilterRule(rule);
    this.addRule2FilteringRules(rule);
  }

  addRule2FilteringRules(rule) {
    let idx: number = this.filteringRules.findIndex(x => x.className == rule.className);
    let r: Rule = { propertyOperand: rule.attribute, operator: rule.operator, inputOperand: rule.value, ruleOperator: rule.logicOperator };
    if (rule.attributeType == 'datetime') {
      r.inputOperand = new Date(rule.value).toLocaleString();
    }
    if (idx == -1) {
      this.filteringRules.push({ className: rule.className, rules: [r] })
    } else {
      this.filteringRules[idx].rules.push(r)
    }
  }

  createFilterRule(rule) {
    rule.paramName = rule.attribute + "_" + rule.id;
    this.filteringParams[rule.paramName] = rule.value;

    const className = rule.className;
    let allRules = this.allFilteringRules;
    if (allRules.hasOwnProperty(className)) {
      let typeRules = allRules[className].rules;
      typeRules.push(rule);
    }
    else {
      this.filteredTypeCount++;
      const variableName = className.toLowerCase() + '_' + this.filteredTypeCount;
      const leftNode = variableName + '_left';
      const rightNode = variableName + '_right';

      let typeRuleObj = {
        className: className,
        variableName: variableName,
        type: rule.type,
        rules: [rule],
        leftNode: null,
        rightNode: null
      };

      if (rule.type === 'edge') {
        typeRuleObj.leftNode = leftNode;
        typeRuleObj.rightNode = rightNode;
      }

      allRules[className] = typeRuleObj;
    }
  }

  deleteFilterRule(i: number, j: number) {
    this.ruleCount--;
    let cName: string = this.filteringRules[i].className;
    if (this.filteringRules[i].rules.length == 1) {
      this.filteringRules.splice(i, 1);
      delete this.allFilteringRules[cName]
    } else {
      this.filteringRules[i].rules.splice(j, 1);
      this.allFilteringRules[cName].rules.splice(j, 1);
    }
  }

  changeFilterRuleOrder(i: number, j: number, isUp: boolean) {
    if ((isUp && j == 0) || (!isUp && j == this.filteringRules[i].rules.length - 1)) {
      return;
    }
    let idx = j + 1;
    if (isUp) {
      idx = j - 1;
    }
    let tmp = this.filteringRules[i].rules[j];
    this.filteringRules[i].rules[j] = this.filteringRules[i].rules[idx];
    this.filteringRules[i].rules[idx] = tmp;
  }

  runFilteringOnlyOnGraph() {
    let filterByRule = function (rule, ele) {
      const attr = rule.attribute;
      const op = rule.operator;
      const ruleVal = rule.value;
      const eleVal = ele.data(attr);
      if (rule.attributeType === 'string' && this._g.isIgnoreCaseInText) {
        return compare(eleVal.toLowerCase(), ruleVal.toLowerCase(), op);
      }
      return compare(eleVal, ruleVal, op);
    }.bind(this);

    this._g.viewUtils.hide(this._g.cy.$());

    let nodes = this._g.cy.collection();
    let edges = this._g.cy.collection();

    const filteringRules = this.allFilteringRules;
    for (const className in filteringRules) {
      const ruleObj = filteringRules[className];
      const rules = ruleObj.rules;
      const type = ruleObj.type;

      let eles = this._g.cy.$(type + "." + className);
      let shownEles = (type.toLowerCase() === 'node') ? nodes : edges;
      for (let i = 0; i < rules.length; i++) {
        const rule = rules[i];
        const logicOp = rule.logicOperator;

        if (i > 0 && logicOp.toLowerCase() === 'or') {
          shownEles.merge(eles);
          eles = this._g.cy.$(type + "." + className);
        }
        eles = eles.filter(ele => { return filterByRule(rule, ele) });
      }
      shownEles.merge(eles);
    }
    nodes.merge(edges.connectedNodes());
    this._g.viewUtils.show(nodes, edges);

    this._g.applyClassFiltering();
    this._timebarService.cyElemListChanged();

    function compare(a, b, operator) {
      const cmpFunc = COMPARE_FUNCTIONS[operator.toLowerCase()];
      return !cmpFunc ? false : cmpFunc(a, b);
    }
  }

  runFilteringOnDatabase() {
    if ($.isEmptyObject(this.allFilteringRules) || $.isEmptyObject(this.filteringParams))
      return;

    const mergeContent = this.isMergeQueryResults && this._g.cy.elements().length > 0;
    console.log('allRules: ', this.allFilteringRules, ' params: ', this.filteringParams);
    this._dbService.runFilteringQuery(this.allFilteringRules, this.filteringParams, (response) => this._cyService.loadElementsFromDatabase(response, mergeContent));
  }

  runFiltering() {
    console.log('isFilterOnDb: ', this.isFilterOnDb, ' isMerge: ', this.isMergeQueryResults);
    if (this.isFilterOnDb) {
      this.runFilteringOnDatabase();
    } else {
      this.runFilteringOnlyOnGraph();
    }
  }

  filterElesByClass(event) {
    const source = $(event.target);
    const willBeShowed = source.hasClass(FILTER_CLASS_HIDE);
    const classText = source.text();

    source.blur();
    source.toggleClass(FILTER_CLASS_HIDE);

    if (willBeShowed) {
      this._g.hiddenClasses.delete(classText);
      this._g.viewUtils.show(this._g.cy.$('.' + classText));
    }
    else {
      this._g.hiddenClasses.add(classText);
      this._g.viewUtils.hide(this._g.cy.$('.' + classText));
    }
    // this.appManager.visibilityChanged();
    this._timebarService.cyElemListChanged();
  }

}

interface ClassOption {
  text: string;
  isDisabled: boolean;
}

interface ClassBasedRules {
  className: string;
  rules: Rule[];

}

interface Rule {
  propertyOperand: string;
  operator: string;
  inputOperand: string;
  ruleOperator: string;
}