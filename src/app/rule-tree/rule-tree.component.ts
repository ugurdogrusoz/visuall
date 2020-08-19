import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { RuleNode, Rule } from '../operation-tabs/map-tab/query-types';

@Component({
  selector: 'app-rule-tree',
  templateUrl: './rule-tree.component.html',
  styleUrls: ['./rule-tree.component.css']
})
export class RuleTreeComponent implements OnInit {

  constructor() { }
  @Input() root: RuleNode;
  @Output() onRuleRequested = new EventEmitter<RuleNode>();
  @Output() onEmpty = new EventEmitter<boolean>();
  @Output() onOperatorAdded = new EventEmitter<RuleNode>();
  currNode: RuleNode;
  isShowChildren = true;

  ngOnInit(): void {
  }

  operatorClicked(r: RuleNode) {
    const op = r.r.ruleOperator;
    if (op == 'AND') {
      r.r.ruleOperator = 'OR';
    } else {
      r.r.ruleOperator = 'AND';
    }
  }

  addOperator(curr: RuleNode, code: 'AND' | 'OR') {
    const newNode: RuleNode = { r: curr.r, children: [], parent: curr };
    curr.r = { ruleOperator: code };
    curr.children.push(newNode);
    this.currNode = curr;
    this.operatorEmitter(curr);
  }

  operatorEmitter(r: RuleNode) {
    this.onOperatorAdded.emit(r);
  }

  deleteNode(node: RuleNode) {
    const parent = node.parent;
    if (parent) {
      const idx = parent.children.indexOf(node);
      parent.children.splice(idx, 1);
    } else {
      this.root = null;
      this.onEmpty.emit(true);
    }
  }

  addRule(curr: RuleNode) {
    this.onRuleRequested.emit(curr);
  }

  changeQueryRuleOrder(node: RuleNode, isUp: boolean) {
    const parent = node.parent;
    const j = parent.children.indexOf(node);
    if ((isUp && j == 0) || (!isUp && j == parent.children.length - 1)) {
      return;
    }
    let idx = j + 1;
    if (isUp) {
      idx = j - 1;
    }
    let tmp = parent.children[j];
    parent.children[j] = parent.children[idx];
    parent.children[idx] = tmp;
  }

}
