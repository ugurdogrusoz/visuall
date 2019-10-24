import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GlobalVariableService } from './global-variable.service';
import { ClassBasedRules, Rule } from './operation-tabs/filter-tab/filtering-types';

@Injectable({
  providedIn: 'root'
})
export class DbService {
  // neo4j database using graphene db heroku add-on
  private dbConfig = {
    url: 'http://ivis.cs.bilkent.edu.tr:7474/db/data/transaction/commit',
    username: 'neo4j',
    password: '123'
    // url: 'https://hobby-npjcdeakghmjgbkeejdgpocl.dbs.graphenedb.com:24780/db/data/transaction/commit',
    // username: 'app127491101-An69vH',
    // password: 'b.i5WWJaGHdH4h.RLVDXx9PyExkPHDa'
  };

  constructor(private _http: HttpClient, private _g: GlobalVariableService) {
   }

  runQuery(query, params, cb, isGraphResponse = true) {
    const url = this.dbConfig.url;
    const username = this.dbConfig.username;
    const password = this.dbConfig.password;
    let requestType = isGraphResponse ? 'graph' : 'row';
    console.log(query);
    const requestBody = {
      'statements': [{
        'statement': query,
        'parameters': params,
        'resultDataContents': [requestType]
      }]
    };
    this._http.post(url, requestBody, {
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

  runFilteringQuery2(rules: ClassBasedRules[], cb) {
    let query = '';
    for (let i = 0; i < rules.length; i++) {
      query += this.getMatchWhereClause(rules[i], i);
    }
    query += this.generateFinalQueryBlock2(rules.map(x => x.isEdge));
    this.runQuery(query, null, cb);
  }

  private extractGraphFromQueryResponse(response) {
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

  private extractTableFromQueryResponse(response) {
    if (response.errors && response.errors.length > 0) {
      console.error('DB server returns erronous result', response.errors);
      return;
    }
    return { columns: response.results[0].columns, data: response.results[0].data.map(x => x.row) };
  }

  private getMatchWhereClause(rule: ClassBasedRules, idx: number) {
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
      whereClauseItems.push(this.generateWhereClauseItem2(rules[i], varName));
      if (i < rules.length - 1) {
        whereClauseItems.push(rules[i + 1].ruleOperator);
      }
    }

    return matchClause + 'WHERE ' + whereClauseItems.join(' ') + "\n";
  }

  private generateWhereClauseItem2(rule: Rule, varName: string) {
    let inputOp = '';
    if (rule.propertyType == 'string' || rule.propertyType == 'list') {
      inputOp = `'${rule.rawInput}'`;
    } else {
      inputOp = '' + rule.rawInput;
    }
    if (rule.propertyType === 'list') {
      return `(${inputOp} IN ${varName}.${rule.propertyOperand})`;
    }
    else {
      if (rule.propertyType === 'string' && this._g.isIgnoreCaseInText) {
        return `(LOWER(${varName}.${rule.propertyOperand}) ${rule.operator} LOWER(${inputOp}))`;
      }
      return `(${varName}.${rule.propertyOperand} ${rule.operator} ${inputOp})`;
    }
  }

  private generateFinalQueryBlock2(isEdgeArr: boolean[]) {
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
}
