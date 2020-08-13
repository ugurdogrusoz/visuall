import { GENERIC_TYPE, NEO4J_2_JS_NUMBER_OPERATORS, NEO4J_2_JS_STR_OPERATORS } from 'src/app/constants';

export interface QueryRule {
  name: string;
  rules: ClassBasedRules2;
  isEditing: boolean;
  isOnDb: boolean;
  isLoadGraph: boolean;
  isMergeGraph: boolean;
}

export interface ClassOption {
  text: string;
  isDisabled: boolean;
}

export interface ClassBasedRules {
  className: string;
  rules: Rule[];
  isEdge: boolean;
}

export interface ClassBasedRules2 {
  className: string;
  rules: RuleNode;
  isEdge: boolean;
}

export interface RuleNode {
  r: Rule;
  children: RuleNode[];
  parent: RuleNode;
}

export enum PropertyCategory {
  other = 0, date = 1, finiteSet = 2
}

export interface Rule {
  propertyOperand?: string;
  propertyType?: string;
  operator?: string;
  inputOperand?: string;
  ruleOperator: 'AND' | 'OR' | null;
  rawInput?: string;
  enumMapping?: string;
}

export interface RuleSync {
  properties: string[];
  isGenericTypeSelected: boolean;
  selectedClass: string;
}

// 2 type of metric exists: sum or count. 
// Sum: sums the property value without conditions
// Count: counts the elements which satisfy the conditional expressions
export interface TimebarMetric {
  incrementFn: (x: any) => number;
  rules: Rule[];
  name: string;
  className: string;
  isEdge?: boolean;
  isEditing?: boolean;
  color?: string;
}

export interface TimebarUnitData {
  isBegin: boolean;
  d: number;
  id: string;
}

export interface TimebarItem {
  start: number;
  end: number;
  cyElem: any;
}

export function getBoolExpressionFromMetric(m: TimebarMetric | ClassBasedRules): string {
  let classCondition = '';
  // apply class condition
  if (m.className.toLowerCase() == GENERIC_TYPE.EDGES_CLASS.toLowerCase()) {
    classCondition = ` x.isEdge() `;
  } else if (m.className.toLowerCase() == GENERIC_TYPE.NODES_CLASS.toLowerCase()) {
    classCondition = ` x.isNode() `;
  } else if (m.className.toLowerCase() == GENERIC_TYPE.ANY_CLASS.toLowerCase()) {
    classCondition = ` true `;
  } else {
    classCondition = ` x.classes().map(x => x.toLowerCase()).includes('${m.className.toLowerCase()}') `;
  }

  let propertyCondition = '';
  let prevBoolExp = '';
  for (let [i, r] of m.rules.entries()) {
    let boolExp = '';
    // apply property condition
    if (r.operator != null && r.operator != undefined && r.inputOperand != null && r.inputOperand != undefined) {
      boolExp = getJsExpressionForMetricRule(r);
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

export function getBoolExpressionFromMetric2(m: ClassBasedRules2): string {
  let classCondition = '';
  // apply class condition
  if (m.className.toLowerCase() == GENERIC_TYPE.EDGES_CLASS.toLowerCase()) {
    classCondition = ` x.isEdge() `;
  } else if (m.className.toLowerCase() == GENERIC_TYPE.NODES_CLASS.toLowerCase()) {
    classCondition = ` x.isNode() `;
  } else if (m.className.toLowerCase() == GENERIC_TYPE.ANY_CLASS.toLowerCase()) {
    classCondition = ` true `;
  } else {
    classCondition = ` x.classes().map(x => x.toLowerCase()).includes('${m.className.toLowerCase()}') `;
  }

  let propertyCondition = getBoolExpressionFromRuleNode(m.rules);

  if (propertyCondition.length < 1) {
    return `if (${classCondition})`;
  }
  return `if ( (${classCondition}) && (${propertyCondition}))`;
}

function getBoolExpressionFromRuleNode(node: RuleNode) {
  let s = '(';
  if (!node.r.ruleOperator) {
    s += ' ' + getJsExpressionForMetricRule(node.r) + ' ';
  } else {
    for (let i = 0; i < node.children.length; i++) {
      if (i != node.children.length - 1) {
        let op = '&&';
        if (node.r.ruleOperator == 'OR') {
          op = '||';
        }
        s += ' ' + getBoolExpressionFromRuleNode(node.children[i]) + ' ' + op;
      } else {
        s += ' ' + getBoolExpressionFromRuleNode(node.children[i]) + ' ';
      }
    }
  }

  return s + ')';
}


function getJsExpressionForMetricRule(r: Rule) {
  if (r.operator == 'One of') {
    let s = r.inputOperand;
    s = s.replace(/'/g, '');
    if (r.propertyType == 'string') {
      let arr = s.split(',').map(x => `'${x}'`);
      s = arr.join(',')
    }
    if (r.propertyType == 'edge') {
      return `[${s}].includes(x.connectedEdges('.${r.propertyOperand}').length)`;
    }
    return `[${s}].includes(x.data('${r.propertyOperand}'))`;
  }
  if (r.propertyType == 'int' || r.propertyType == 'float' || r.propertyType == 'datetime' || r.propertyType == 'edge') {
    let op = NEO4J_2_JS_NUMBER_OPERATORS[r.operator];
    if (r.propertyType == 'datetime') {
      return `x.data('${r.propertyOperand}') ${op} ${r.rawInput}`;
    }
    if (r.propertyType == 'edge') {
      return `x.connectedEdges('.${r.propertyOperand}').length ${op} ${r.inputOperand}`;
    }
    return `x.data('${r.propertyOperand}') ${op} ${r.inputOperand}`;
  }
  if (r.propertyType == 'string') {
    if (r.operator === '=') {
      return `x.data('${r.propertyOperand}') === '${r.inputOperand}'`;
    }
    let op = NEO4J_2_JS_STR_OPERATORS[r.operator];
    return `x.data('${r.propertyOperand}').${op}('${r.inputOperand}')`;
  }
  if (r.propertyType == 'list') {
    return `x.data('${r.propertyOperand}').includes('${r.inputOperand}')`;
  }
  if (r.propertyType.startsWith('enum')) {
    let op = NEO4J_2_JS_NUMBER_OPERATORS[r.operator];
    if (r.propertyType.endsWith('string')) {
      return `x.data('${r.propertyOperand}') ${op} '${r.inputOperand}'`;
    } else {
      return `x.data('${r.propertyOperand}') ${op} ${r.inputOperand}`;
    }
  }
}

export function rule2str(r: ClassBasedRules): string {
  let s = `<b>${r.className}</b>`;
  if (r.rules.length == 1 && !r.rules[0].propertyType) {
    return s;
  }
  if (r.rules.length > 0) {
    s += ' where ';
  }
  for (let i = 0; i < r.rules.length; i++) {
    let curr = r.rules[i];
    let inp = '' + curr.inputOperand;
    if (curr.propertyType == 'string') {
      inp = `"${inp}"`;
    }
    s += ` (<b>${curr.propertyOperand}</b> ${curr.operator} <b>${inp}</b>) `;
    if (i != r.rules.length - 1) {
      s += r.rules[i + 1].ruleOperator;
    }
  }
  return s;
}

function r2str(curr: Rule) {
  let s = '';
  let inp = '' + curr.inputOperand;
  if (curr.propertyType == 'string') {
    inp = `"${inp}"`;
  }
  s += ` (<b>${curr.propertyOperand}</b> ${curr.operator} <b>${inp}</b>) `;
  return s;
}

export function rule2str2(r: ClassBasedRules2): string {
  let s = `<b>${r.className}</b>`;
  if (r.rules.children.length == 0 || !r.rules.children[0].r.propertyType) {
    return s;
  }
  s += ' where ' + ruleNode2str(r.rules);
  return s;
}

function ruleNode2str(node: RuleNode) {
  let s = '(';
  if (!node.r.ruleOperator) {
    s += ' ' + r2str(node.r) + ' ';
  } else {
    for (let i = 0; i < node.children.length; i++) {
      if (i != node.children.length - 1) {
        let op = '&&';
        if (node.r.ruleOperator == 'OR') {
          op = '||';
        }
        s += ' ' + ruleNode2str(node.children[i]) + ' ' + op;
      } else {
        s += ' ' + ruleNode2str(node.children[i]) + ' ';
      }
    }
  }

  return s + ')';
}