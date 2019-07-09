import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GlobalVariableService } from './global-variable.service';

@Injectable({
  providedIn: 'root'
})
export class DbService {
  // neo4j database using graphene db heroku add-on
  private dbConfig = {
    url: 'https://hobby-npjcdeakghmjgbkeejdgpocl.dbs.graphenedb.com:24780/db/data/transaction/commit',
    username: 'app127491101-An69vH',
    password: 'b.i5WWJaGHdH4h.RLVDXx9PyExkPHDa'
  };

  constructor(private http: HttpClient, private _g: GlobalVariableService) { }

  runQuery(query, params, cb, isGraphResponse = true) {
    const url = this.dbConfig.url;
    const username = this.dbConfig.username;
    const password = this.dbConfig.password;
    let requestType = isGraphResponse ? 'graph' : 'row';

    const requestBody = {
      'statements': [{
        'statement': query,
        'parameters': params,
        'resultDataContents': [requestType]
      }]
    };
    this.http.post(url, requestBody, {
      headers: {
        Accept: 'application/json; charset=UTF-8',
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(username + ':' + password)
      }
    }).subscribe((data) => {
      if (isGraphResponse) {
        cb(this.extractGraphFromQueryResponse(data));
      } else {
        cb(this.extractTableFromQueryResponse(data));
      }
    },
      (err) => { console.log('err db.service line 34: ', err) });

  }

  extractGraphFromQueryResponse(response) {
    let nodes = {};
    let edges = {};

    const results = response.results[0];
    if (!results) {
      console.error('Invalid query!', response.errors[0]);
      return;
    }

    const data = response.results[0].data;
    for (let i = 0; i < data.length; i++) {
      const graph = data[i].graph;
      const graph_nodes = graph.nodes;
      const graph_edges = graph.relationships;

      for (let node of graph_nodes) {
        const node_id = node.id;
        nodes[node_id] = node;
      }

      for (let edge of graph_edges) {
        const edge_id = edge.id;
        edges[edge_id] = edge;
      }
    }

    return { 'nodes': nodes, 'edges': edges };
  }

  extractTableFromQueryResponse(response) {
    if (response.errors && response.errors.length > 0) {
      console.error('DB server returns erronous result', response.errors);
      return;
    }
    return { columns: response.results[0].columns, data: response.results[0].data.map(x => x.row) };
  }

  runFilteringQuery(rules, params, cb) {
    let variableList = [];
    let query = '';

    const classNames = Object.keys(rules);
    for (let i = 0; i < classNames.length; i++) {
      const className = classNames[i];
      const ruleObject = rules[className];
      const hasWithClause = (i === classNames.length - 1);

      query += this.generateQueryBlock(ruleObject, variableList, hasWithClause);
    }

    query += this.generateFinalQueryBlock(variableList);
    this.runQuery(query, params, cb);
  }

  generateQueryBlock(rule, variableList, hasWithClause) {
    const matchClause = this.generateMatchClause(rule);
    const whereClause = this.generateWhereClause(rule);
    const withClause = this.generateWithClause(rule, variableList);

    let queryBlock = matchClause + whereClause;
    if (hasWithClause)
      queryBlock += withClause;

    return queryBlock;
  }

  generateMatchClause(rule) {
    const className = rule.className;
    const variableName = rule.variableName;
    let matchClause;

    if (rule.type === 'edge') {
      const leftNode = rule.leftNode;
      const rightNode = rule.rightNode;
      matchClause = `OPTIONAL MATCH (${leftNode})-[${variableName}:${className}]-(${rightNode})\n`;
    }
    else {
      matchClause = `OPTIONAL MATCH (${variableName}:${className})\n`;
    }

    return matchClause;
  }

  generateWhereClause(rule) {
    const rules = rule.rules;
    const variableName = rule.variableName;
    if (!rules || rules.length < 1)
      return '';

    let whereClauseItems = [this.generateWhereClauseItem(rules[0], variableName)];
    for (let i = 1; i < rules.length; i++) {
      const ruleItem = rules[i];
      const whereClauseItem = this.generateWhereClauseItem(ruleItem, variableName);
      whereClauseItems.push(ruleItem.logicOperator, whereClauseItem);
    }

    return 'WHERE ' + whereClauseItems.join(' ') + "\n";
  }

  generateWhereClauseItem(rule, variableName) {
    const operator = rule.operator;
    const paramName = rule.paramName;
    const attribute = rule.attribute;

    if (rule.attributeType === 'list') {
      return `($${paramName} IN ${variableName}.${attribute})`;
    }
    else {
      if (rule.attributeType === 'string' && this._g.isIgnoreCaseInText) {
        return `( LOWER(${variableName}.${attribute}) ${operator} LOWER($${paramName}) )`;
      }
      return `(${variableName}.${attribute} ${operator} $${paramName})`;
    }
  }

  generateWithClause(rule, variableList) {
    const leftNode = rule.leftNode;
    const rightNode = rule.rightNode;
    const variableName = rule.variableName;

    if (rule.type === 'edge')
      variableList.push(leftNode, rightNode);
    else
      variableList.push(variableName);

    return 'WITH ' + variableList.join(', ') + "\n";
  }

  generateFinalQueryBlock(variableList) {
    let withClause = [];
    for (const variable of variableList) {
      withClause.push(`collect(${variable}) as ${variable + 'List'}`);
    }

    let leftOfWhereClause = [], rightOfWhereClause = [];
    for (const variable of variableList) {
      const left = `(n1 in ${variable + 'List'})`;
      const right = `(n2 in ${variable + 'List'})`;
      leftOfWhereClause.push(left);
      rightOfWhereClause.push(right);
    }

    return `WITH ${withClause.join(', ')}\n`
      + 'MATCH p=(n1)-[*0..1]-(n2)\n'
      + `WHERE (${leftOfWhereClause.join(' or ')}) and (${rightOfWhereClause.join(' or ')})\n`
      + 'RETURN nodes(p), relationships(p)\n';
  }
}
