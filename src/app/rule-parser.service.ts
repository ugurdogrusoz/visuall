import { Injectable } from '@angular/core';
import { iClassBasedRules, iRule } from './operation-tabs/filter-tab/filtering-types';
import { GlobalVariableService } from './global-variable.service';

@Injectable({
  providedIn: 'root'
})
export class RuleParserService {

  constructor(private _g: GlobalVariableService) { }

  // methods for conversion to CQL
  rule2cql(rules: iClassBasedRules[]) {
    let query = '';
    for (let i = 0; i < rules.length; i++) {
      query += this.getCql4Rules(rules[i], i);
    }
    query += this.generateFinalQueryBlock(rules.map(x => x.isEdge));
    return query;
  }

  private getCql4Rules(rule: iClassBasedRules, idx: number) {
    const className = rule.className;
    let matchClause: string;
    let varName = 'x' + idx;
    if (rule.isEdge) {
      matchClause = `OPTIONAL MATCH (${varName}_l)-[${varName}:${className}]-(${varName}_r)\n`;
    }
    else {
      matchClause = `OPTIONAL MATCH (${varName}:${className})\n`;
    }

    const rules = rule.rules;
    if (!rules || rules.length < 1)
      return '';

    let whereClauseItems = [];
    for (let i = 0; i < rules.length; i++) {
      whereClauseItems.push(this.getConditio4Rule(rules[i], varName));
      if (i < rules.length - 1) {
        whereClauseItems.push(rules[i + 1].ruleOperator);
      }
    }

    return matchClause + 'WHERE ' + whereClauseItems.join(' ') + "\n";
  }

  private getConditio4Rule(rule: iRule, varName: string) {
    console.log('getConditio4Rule: ', rule);
    let inputOp = '';
    if (rule.propertyType == 'string' || rule.propertyType == 'list') {
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

    }
    else {
      if (rule.propertyType == 'string' && this._g.isIgnoreCaseInText) {
        return `(LOWER(${varName}.${rule.propertyOperand}) ${rule.operator} LOWER(${inputOp}))`;
      }
      return `(${varName}.${rule.propertyOperand} ${rule.operator} ${inputOp})`;
    }
  }

  private generateFinalQueryBlock(isEdgeArr: boolean[]) {
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
    s += `\nMATCH p=(n1)-[*0..1]-(n2)
    WHERE (n1 in nodeList) and (n2 in nodeList)
    RETURN nodes(p), relationships(p)`;
    return s;
  }
  // end of methods for conversion to CQL


}
