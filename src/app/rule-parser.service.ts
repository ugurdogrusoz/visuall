import { Injectable } from '@angular/core';
import { ClassBasedRules, Rule, CqlType } from './operation-tabs/filter-tab/filtering-types';
import { GlobalVariableService } from './global-variable.service';
import { GENERIC_TYPE } from './constants';
import ModelDescription from '../assets/model_description.json';

@Injectable({
  providedIn: 'root'
})
export class RuleParserService {

  constructor(private _g: GlobalVariableService) { }

  // methods for conversion to CQL
  rule2cql(rules: ClassBasedRules, skip: number, limit: number, type: CqlType) {
    let query = '';
    query += this.getCql4Rules(rules);
    query += this.generateFinalQueryBlock(rules.isEdge, skip, limit, type);
    return query;
  }

  private getCql4Rules(rule: ClassBasedRules) {
    let isGenericType = false;
    if (rule.className == GENERIC_TYPE.ANY_CLASS || rule.className == GENERIC_TYPE.EDGES_CLASS || rule.className == GENERIC_TYPE.NODES_CLASS) {
      isGenericType = true;
    }
    let classFilter = ':' + rule.className;
    if (isGenericType) {
      classFilter = '';
    }
    let matchClause: string;
    if (rule.isEdge) {
      let s = ModelDescription.relations[rule.className].source;
      let t = ModelDescription.relations[rule.className].target;
      let conn = '>';
      let isBidirectional = ModelDescription.relations[rule.className].isBidirectional;
      if (isBidirectional) {
        conn = '';
      }
      matchClause = `OPTIONAL MATCH (:${s})-[x${classFilter}]-${conn}(:${t})\n`;
    }
    else {
      matchClause = `OPTIONAL MATCH (x${classFilter})\n`;
    }

    const rules = rule.rules;
    if (!rules || rules.length < 1)
      return '';

    let whereClauseItems = [];
    for (let i = 0; i < rules.length; i++) {
      whereClauseItems.push(this.getCondition4Rule(rules[i]));
      if (i < rules.length - 1) {
        whereClauseItems.push(rules[i + 1].ruleOperator);
      }
    }

    return matchClause + 'WHERE ' + whereClauseItems.join(' ') + "\n";
  }

  private getCondition4Rule(rule: Rule) {
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
      return `(${inputOp} IN x.${rule.propertyOperand})`;
    } else if (rule.propertyType == 'edge') {
      if (!rule.operator || !rule.inputOperand || rule.inputOperand.length < 1) {
        return `( size((x)-[:${rule.propertyOperand}]-()) > 0 )`;
      }
      return `( size((x)-[:${rule.propertyOperand}]-()) ${rule.operator} ${rule.inputOperand} )`;
    } else {
      if (rule.propertyType == 'string' && this._g.userPrefs.isIgnoreCaseInText.getValue()) {
        return `(LOWER(x.${rule.propertyOperand}) ${rule.operator} LOWER(${inputOp}))`;
      }
      return `(x.${rule.propertyOperand} ${rule.operator} ${inputOp})`;
    }
  }

  private generateFinalQueryBlock(isEdge: boolean, skip: number, limit: number, type: CqlType) {
    if (type == CqlType.table) {
      return `RETURN ID(x), x  SKIP ${skip} LIMIT ${limit}`;
    } else if (type == CqlType.std) {
      return `RETURN x SKIP ${skip} LIMIT ${limit}`;
    } else if (type == CqlType.count) {
      return `RETURN count(x)`;
    }
    return '';
  }
  // end of methods for conversion to CQL


}
