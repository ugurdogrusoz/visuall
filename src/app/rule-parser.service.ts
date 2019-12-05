import { Injectable } from '@angular/core';
import { iClassBasedRules, iRule } from './operation-tabs/filter-tab/filtering-types';
import { GlobalVariableService } from './global-variable.service';
import { GENERIC_TYPE } from './constants';

@Injectable({
  providedIn: 'root'
})
export class RuleParserService {

  constructor(private _g: GlobalVariableService) { }

  // methods for conversion to CQL
  rule2cql(rules: iClassBasedRules[], skip: number, limit: number, isTableForm: boolean = false) {
    let query = '';
    for (let i = 0; i < rules.length; i++) {
      query += this.getCql4Rules(rules[i], i);
    }
    query += this.generateFinalQueryBlock(rules.map(x => x.isEdge), skip, limit, isTableForm);
    return query;
  }

  private getCql4Rules(rule: iClassBasedRules, idx: number) {
    let isGenericType = false;
    if (rule.className == GENERIC_TYPE.ANY_CLASS || rule.className == GENERIC_TYPE.EDGES_CLASS || rule.className == GENERIC_TYPE.NODES_CLASS) {
      isGenericType = true;
    }
    let classFilter = ':' + rule.className;
    if (isGenericType) {
      classFilter = '';
    }
    let matchClause: string;
    let varName = 'x' + idx;
    if (rule.isEdge) {
      matchClause = `OPTIONAL MATCH (${varName}_l)-[${varName}${classFilter}]-(${varName}_r)\n`;
    }
    else {
      matchClause = `OPTIONAL MATCH (${varName}${classFilter})\n`;
    }

    const rules = rule.rules;
    if (!rules || rules.length < 1)
      return '';

    let whereClauseItems = [];
    for (let i = 0; i < rules.length; i++) {
      whereClauseItems.push(this.getCondition4Rule(rules[i], varName));
      if (i < rules.length - 1) {
        whereClauseItems.push(rules[i + 1].ruleOperator);
      }
    }

    return matchClause + 'WHERE ' + whereClauseItems.join(' ') + "\n";
  }

  private getCondition4Rule(rule: iRule, varName: string) {
    if (!rule.propertyOperand || rule.propertyOperand == GENERIC_TYPE.NOT_SELECTED) {
      return '(TRUE)';
    }
    let inputOp = '';
    if (rule.propertyType == 'string' || rule.propertyType == 'list' || rule.propertyType.startsWith('enum')) {
      inputOp = `'${rule.rawInput}'`;
    } else {
      inputOp = '' + rule.rawInput;
    }
    if (rule.propertyType == 'list') {
      return `(${inputOp} IN ${varName}.${rule.propertyOperand})`;
    } else if (rule.propertyType == 'edge') {
      if (!rule.operator || !rule.inputOperand || rule.inputOperand.length < 1) {
        return `( size((${varName})-[:${rule.propertyOperand}]-()) > 0 )`;
      }
      return `( size((${varName})-[:${rule.propertyOperand}]-()) ${rule.operator} ${rule.inputOperand} )`;
    } else {
      if (rule.propertyType == 'string' && this._g.isIgnoreCaseInText) {
        return `(LOWER(${varName}.${rule.propertyOperand}) ${rule.operator} LOWER(${inputOp}))`;
      }
      return `(${varName}.${rule.propertyOperand} ${rule.operator} ${inputOp})`;
    }
  }

  private generateFinalQueryBlock(isEdgeArr: boolean[], skip: number, limit: number, isTableForm: boolean = false) {
    let s = 'WITH (';
    for (let i = 0; i < isEdgeArr.length; i++) {
      if (isEdgeArr[i]) {
        s += `COLLECT(x${i}_l) + COLLECT(x${i}_r) + `;
      } else {
        s += `COLLECT(x${i}) + `;
      }
    }
    s = s.substr(0, s.length - 2);
    s += ') AS nodeList';
    s += `\nMATCH p=(n1)-[*0..1]-(n2) WHERE (n1 in nodeList) and (n2 in nodeList) `
    if (isTableForm) {
      s += `UNWIND nodes(p) as aNode RETURN ID(aNode), aNode  SKIP ${skip} LIMIT ${limit}`;
    } else {
      s += `RETURN nodes(p), relationships(p) SKIP ${skip} LIMIT ${limit}`;
    }
    return s;
  }
  // end of methods for conversion to CQL


}
