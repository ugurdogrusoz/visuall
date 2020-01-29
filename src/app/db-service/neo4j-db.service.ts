import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GlobalVariableService } from '../global-variable.service';
import { GraphResponse, TableResponse, DbService, DbQueryType } from './data-types';
import { ClassBasedRules, Rule } from '../operation-tabs/map-tab/filtering-types';
import { GENERIC_TYPE } from '../constants';
import AppDescription from '../../assets/app_description.json';

@Injectable({
  providedIn: 'root'
})
export class Neo4jDb implements DbService {

  // default database config, in case it is not read from visuall-config.json
  private dbConfig = {
    url: 'http://ivis.cs.bilkent.edu.tr:3001/db/data/transaction/commit',
    username: 'neo4j',
    password: '123'
  };

  constructor(private _http: HttpClient, private _g: GlobalVariableService) {
    this._g.getConfig().subscribe(x => { this.dbConfig = x['database'] }, error => console.log('getConfig err: ', error));
  }

  getNeighbors(elemId: string, callback: (x: GraphResponse) => any) {
    this.runQuery(`MATCH (n)-[e]-(n2) WHERE ID(n) = ${elemId} RETURN n,n2,e`, callback);
  }

  getSampleData(callback: (x: GraphResponse) => any) {
    this.runQuery(`MATCH (n)-[e]-() RETURN n,e limit 33`, callback);
  }

  getAllData(callback: (x: GraphResponse) => any) {
    this.runQuery(`MATCH (n) RETURN n UNION MATCH ()-[e]-() RETURN distinct e as n`, callback);
  }

  getFilteringResult(rules: ClassBasedRules, skip: number, limit: number, type: DbQueryType, callback: (x: GraphResponse | TableResponse) => any) {
    const cql = this.rule2cql(rules, skip, limit, type);
    this.runQuery(cql, callback, type == DbQueryType.std);
  }

  getCount4Q0(d1: number, d2: number, movieCount: number, callback: (x) => any) {
    let cql = `MATCH (n:Person)-[r:ACTED_IN]->(:Movie)
    WHERE r.act_begin >= ${d1} AND r.act_end <= ${d2}  
    WITH n, SIZE(COLLECT(r)) as degree
    WHERE degree >= ${movieCount}
    RETURN DISTINCT COUNT(*)`;
    this.runQuery(cql, callback, false);
  }

  getTable4Q0(d1: number, d2: number, movieCnt: number, skip: number, limit: number, callback: (x) => any) {
    let cql = `MATCH (n:Person)-[r:ACTED_IN]->(:Movie)
    WHERE r.act_begin >= ${d1} AND r.act_end <= ${d2}  
    WITH n, SIZE(COLLECT(r)) as degree
    WHERE degree >= ${movieCnt}
    RETURN DISTINCT ID(n) as id, n.name as Actor, degree as Count 
    ORDER BY degree DESC SKIP ${skip} LIMIT ${limit}`;
    this.runQuery(cql, callback, false);
  }

  getGraph4Q0(d1: number, d2: number, movieCnt: number, skip: number, limit: number, callback: (x) => any) {
    let cql = `MATCH (n:Person)-[r:ACTED_IN]->(:Movie)
      WHERE r.act_begin >= ${d1} AND r.act_end <= ${d2}  
      WITH n, SIZE(COLLECT(r)) as degree, COLLECT(r) as edges
      WHERE degree >= ${movieCnt}
      RETURN n, edges ORDER BY degree DESC SKIP ${skip} LIMIT ${limit}`;
    this.runQuery(cql, callback);
  }

  getDataForQ0(id: number, d1: number, d2: number, callback: (x) => any) {
    let cql =
      `MATCH p=(n:Person)-[r:ACTED_IN]->(:Movie) WHERE ID(n) = ${id} AND r.act_begin >= ${d1} AND r.act_end <= ${d2}
    RETURN nodes(p), relationships(p)`;
    this.runQuery(cql, callback);
  }

  getCount4Q1(d1: number, d2: number, genre: string, callback: (x) => any) {
    let cql = ` MATCH (m:Movie {genre:'${genre}'})
    WHERE m.released> ${d1} AND m.released < ${d2}  
    RETURN DISTINCT COUNT(*)`;
    this.runQuery(cql, callback, false);
  }

  getTable4Q1(d1: number, d2: number, genre: string, skip: number, limit: number, callback: (x) => any) {
    let cql = ` MATCH (m:Movie {genre:'${genre}'})
    WHERE m.released > ${d1} AND m.released < ${d2}  
    RETURN DISTINCT ID(m) as id, m.title
    ORDER BY m.title DESC SKIP ${skip} LIMIT ${limit}`;
    this.runQuery(cql, callback, false);
  }

  getGraph4Q1(d1: number, d2: number, genre: string, skip: number, limit: number, callback: (x) => any) {
    let cql = `MATCH (m:Movie {genre:'${genre}'})<-[r:ACTED_IN]-(a:Person)
    WHERE m.released > ${d1} AND m.released < ${d2}  
    WITH m, COLLECT(r) as edges
    RETURN  m, edges
    ORDER BY m.title DESC SKIP ${skip} LIMIT ${limit}`;
    this.runQuery(cql, callback);
  }

  getDataForQ1(id: number, d1: number, d2: number, genre: string, callback: (x) => any) {
    let cql =
      `MATCH p=(m:Movie{genre:'${genre}'})<-[:ACTED_IN]-(a:Person) WHERE ID(m) = ${id} 
     AND m.released > ${d1} AND m.released < ${d2}
     RETURN nodes(p), relationships(p)`;
    this.runQuery(cql, callback);
  }

  getMovieGenres(callback: (x: any) => any) {
    this.runQuery('MATCH (m:Movie) return distinct m.genre', callback, false);
  }

  private runQuery(query: string, callback: (x: any) => any, isGraphResponse = true) {
    const url = this.dbConfig.url;
    const username = this.dbConfig.username;
    const password = this.dbConfig.password;
    let requestType = isGraphResponse ? 'graph' : 'row';
    console.log(query);
    this._g.setLoadingStatus(true);
    const requestBody = {
      'statements': [{
        'statement': query,
        'parameters': null,
        'resultDataContents': [requestType]
      }]
    };
    this._http.post(url, requestBody, {
      headers: {
        Accept: 'application/json; charset=UTF-8',
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(username + ':' + password)
      }
    }).subscribe(x => {
      this._g.setLoadingStatus(false);
      if (isGraphResponse) {
        callback(this.extractGraph(x));
      } else {
        callback(this.extractTable(x));
      }
    })
  }

  private extractGraph(response): GraphResponse {
    let nodes = [];
    let edges = [];

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
        nodes.push(node);
      }

      for (let edge of graph_edges) {
        edges.push(edge);
      }
    }

    return { 'nodes': nodes, 'edges': edges };
  }

  private extractTable(response): TableResponse {
    if (response.errors && response.errors.length > 0) {
      console.error('DB server returns erronous result', response.errors);
      return;
    }
    return { columns: response.results[0].columns, data: response.results[0].data.map(x => x.row) };
  }

  // ------------------------------------------------- methods for conversion to CQL -------------------------------------------------
  private rule2cql(rules: ClassBasedRules, skip: number, limit: number, type: DbQueryType) {
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
      let s = AppDescription.relations[rule.className].source;
      let t = AppDescription.relations[rule.className].target;
      let conn = '>';
      let isBidirectional = AppDescription.relations[rule.className].isBidirectional;
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

  private generateFinalQueryBlock(isEdge: boolean, skip: number, limit: number, type: DbQueryType) {
    if (type == DbQueryType.table) {
      return `RETURN ID(x), x  SKIP ${skip} LIMIT ${limit}`;
    } else if (type == DbQueryType.std) {
      return `RETURN x SKIP ${skip} LIMIT ${limit}`;
    } else if (type == DbQueryType.count) {
      return `RETURN COUNT(x)`;
    }
    return '';
  }
  // ------------------------------------------------- end of methods for conversion to CQL -------------------------------------------------

}
