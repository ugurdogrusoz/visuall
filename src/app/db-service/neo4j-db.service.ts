import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GlobalVariableService } from '../global-variable.service';
import { GraphResponse, TableResponse, DbService, DbQueryType } from './data-types';
import { ClassBasedRules, Rule } from '../operation-tabs/map-tab/filtering-types';
import { GENERIC_TYPE } from '../constants';
import AppDescription from '../../assets/app_description.json';
import properties from '../../assets/generated/properties.json'
import { TableFiltering } from '../table-view/table-view-types';

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

  getNeighbors(elemIds: string[] | number[], callback: (x: GraphResponse) => any) {
    let condition = '';
    for (let i = 0; i < elemIds.length; i++) {
      if (i == elemIds.length - 1) {
        condition += ` ID(n) = ${elemIds[i]} `
      } else {
        condition += ` ID(n) = ${elemIds[i]} OR `
      }
    }
    this.runQuery(`MATCH (n)-[e]-(n2) WHERE ${condition} RETURN n,n2,e`, callback);
  }

  getSampleData(callback: (x: GraphResponse) => any) {
    this.runQuery(`MATCH (n)-[e]-() RETURN n,e limit 100`, callback);
  }

  getFilteringResult(rules: ClassBasedRules, filter: TableFiltering, skip: number, limit: number, type: DbQueryType, callback: (x: GraphResponse | TableResponse) => any) {
    const cql = this.rule2cql(rules, skip, limit, type, filter);
    this.runQuery(cql, callback, type == DbQueryType.std);
  }

  filterTable(rules: ClassBasedRules, filter: TableFiltering, skip: number, limit: number, type: DbQueryType, callback: (x: GraphResponse | TableResponse) => any) {
    const cql = this.rule2cql(rules, skip, limit, type, filter);
    this.runQuery(cql, callback, type == DbQueryType.std);
  }

  getCount4Q0(d1: number, d2: number, movieCount: number, callback: (x) => any, filter?: TableFiltering) {
    let txtCondition = this.getQueryCondition4TxtFilter(filter, ['n.name', 'degree']);
    let cql = `MATCH (n:Person)-[r:ACTED_IN]->(:Movie)
    WHERE r.act_begin >= ${d1} AND r.act_end <= ${d2}  
    WITH n, SIZE(COLLECT(r)) as degree
    WHERE degree >= ${movieCount} ${txtCondition}
    RETURN DISTINCT COUNT(*)`;
    this.runQuery(cql, callback, false);
  }

  getTable4Q0(d1: number, d2: number, movieCnt: number, skip: number, limit: number, callback: (x) => any, filter?: TableFiltering) {
    let txtCondition = this.getQueryCondition4TxtFilter(filter, ['n.name', 'degree']);
    let ui2Db = { 'Actor': 'Actor', 'Count': 'Count' };
    let orderExpr = this.getOrderByExpression4Query(filter, 'degree', 'desc', ui2Db);

    let cql = `MATCH (n:Person)-[r:ACTED_IN]->(:Movie)
    WHERE r.act_begin >= ${d1} AND r.act_end <= ${d2}  
    WITH n, SIZE(COLLECT(r)) as degree
    WHERE degree >= ${movieCnt} ${txtCondition}
    RETURN DISTINCT ID(n) as id, n.name as Actor, degree as Count 
    ORDER BY ${orderExpr} SKIP ${skip} LIMIT ${limit}`;
    this.runQuery(cql, callback, false);
  }

  getGraph4Q0(d1: number, d2: number, movieCnt: number, skip: number, limit: number, callback: (x) => any, ids: string[] | number[]) {
    let idFilter = this.buildIdFilter(ids);
    let cql = `MATCH (n:Person)-[r:ACTED_IN]->(:Movie)
      WHERE ${idFilter} r.act_begin >= ${d1} AND r.act_end <= ${d2}  
      WITH n, SIZE(COLLECT(r)) as degree, COLLECT(r) as edges
      WHERE degree >= ${movieCnt}
      RETURN n, edges ORDER BY degree DESC SKIP ${skip} LIMIT ${limit}`;
    this.runQuery(cql, callback);
  }

  getCount4Q1(d1: number, d2: number, genre: string, callback: (x) => any, filter?: TableFiltering) {
    let txtCondition = this.getQueryCondition4TxtFilter(filter, ['m.title']);
    let cql = ` MATCH (m:Movie {genre:'${genre}'})
    WHERE m.released> ${d1} AND m.released < ${d2} ${txtCondition} 
    RETURN DISTINCT COUNT(*)`;
    this.runQuery(cql, callback, false);
  }

  getTable4Q1(d1: number, d2: number, genre: string, skip: number, limit: number, callback: (x) => any, filter?: TableFiltering) {
    let txtCondition = this.getQueryCondition4TxtFilter(filter, ['m.title']);
    let ui2Db = { 'Movie': 'm.title' };
    let orderExpr = this.getOrderByExpression4Query(filter, 'm.title', 'desc', ui2Db);

    let cql = ` MATCH (m:Movie {genre:'${genre}'})
    WHERE m.released > ${d1} AND m.released < ${d2} ${txtCondition} 
    RETURN DISTINCT ID(m) as id, m.title
    ORDER BY ${orderExpr} SKIP ${skip} LIMIT ${limit}`;
    this.runQuery(cql, callback, false);
  }

  getGraph4Q1(d1: number, d2: number, genre: string, skip: number, limit: number, callback: (x) => any, ids: string[] | number[]) {
    let idFilter = this.buildIdFilter(ids);
    let cql = `MATCH (n:Movie {genre:'${genre}'})<-[r:ACTED_IN]-(:Person)
    WHERE ${idFilter}  n.released > ${d1} AND n.released < ${d2}  
    WITH n, COLLECT(r) as edges
    RETURN  n, edges
    ORDER BY n.title DESC SKIP ${skip} LIMIT ${limit}`;
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
  private rule2cql(rules: ClassBasedRules, skip: number, limit: number, type: DbQueryType, filter: TableFiltering = null) {
    let query = '';
    query += this.getCql4Rules(rules, filter);
    query += this.generateFinalQueryBlock(filter, skip, limit, type);
    return query;
  }

  private getCql4Rules(rule: ClassBasedRules, filter: TableFiltering = null) {
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
    let conditions = whereClauseItems.join(' ');
    if (filter != null && filter.txt.length > 0) {
      let s = this.getCondition4TxtFilter(rule.isEdge, rule.className, filter.txt);
      conditions = '(' + conditions + ') AND ' + s;
    }

    return matchClause + 'WHERE ' + conditions + '\n';
  }

  private getCondition4TxtFilter(isEdge: boolean, className: string, txt: string): string {
    let s = '';
    let t = 'nodes';
    if (isEdge) {
      t = 'edges';
    }
    let p = properties[t][className];
    for (let k in p) {
      if (p[k] !== 'list') {
        if (this._g.userPrefs.isIgnoreCaseInText.getValue()) {
          s += ` LOWER(toString(x.${k})) CONTAINS LOWER('${txt}') OR `;
        } else {
          s += ` toString(x.${k}) CONTAINS '${txt}' OR `;
        }
      } else {
        if (this._g.userPrefs.isIgnoreCaseInText.getValue()) {
          s += ` LOWER(REDUCE(s='', w IN x.${k} | s + w)) CONTAINS LOWER('${txt}') OR `;
        } else {
          s += ` REDUCE(s = "", w IN x.${k} | s + w) CONTAINS '${txt}' OR `;
        }
      }
    }
    s = s.slice(0, -3)
    s = '(' + s + ')'
    return s;
  }

  private getCondition4Rule(rule: Rule): string {
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
      let i = this.transformInp(rule, rule.inputOperand);
      return `( size((x)-[:${rule.propertyOperand}]-()) ${rule.operator} ${i} )`;
    } else {
      if (rule.propertyType == 'string' && this._g.userPrefs.isIgnoreCaseInText.getValue()) {
        inputOp = inputOp.toLowerCase();
        inputOp = this.transformInp(rule, inputOp);
        let op = rule.operator != 'One of' ? rule.operator : 'IN';
        return `(LOWER(x.${rule.propertyOperand}) ${op} ${inputOp})`;
      }
      inputOp = this.transformInp(rule, inputOp);
      let op = rule.operator != 'One of' ? rule.operator : 'IN';
      return `(x.${rule.propertyOperand} ${op} ${inputOp})`;
    }
  }

  private transformInp(rule: Rule, inputOp: string): string {
    if (rule.operator != 'One of') {
      return inputOp;
    }
    let s = inputOp;
    s = s.replace(/'/g, '');
    if (rule.propertyType == 'string') {
      let arr = s.split(',').map(x => `'${x}'`);
      return `[${arr.join(',')}]`
    } else {
      return `[${s}]`
    }
  }

  private generateFinalQueryBlock(filter: TableFiltering, skip: number, limit: number, type: DbQueryType) {
    if (type == DbQueryType.table) {
      if (filter != null && filter.orderDirection.length > 0) {
        return `RETURN ID(x), x ORDER BY x.${filter.orderBy} ${filter.orderDirection} SKIP ${skip} LIMIT ${limit}`;
      }
      return `RETURN ID(x), x  SKIP ${skip} LIMIT ${limit}`;
    } else if (type == DbQueryType.std) {
      if (filter != null && filter.orderDirection.length > 0) {
        return `RETURN x ORDER BY x.${filter.orderBy} ${filter.orderDirection} SKIP ${skip} LIMIT ${limit}`;
      }
      return `RETURN x SKIP ${skip} LIMIT ${limit}`;
    } else if (type == DbQueryType.count) {
      return `RETURN COUNT(x)`;
    }
    return '';
  }

  private getQueryCondition4TxtFilter(filter: TableFiltering, cols: string[]): string {
    if (filter == null || filter.txt.length < 1) {
      return '';
    }
    let s = '';

    for (let i = 0; i < cols.length; i++) {
      if (this._g.userPrefs.isIgnoreCaseInText.getValue()) {
        s += ` LOWER(toString(${cols[i]})) CONTAINS LOWER('${filter.txt}') OR `;
      } else {
        s += ` toString(${cols[i]}) CONTAINS '${filter.txt}' OR `;
      }
    }
    s = s.slice(0, -3)
    s = 'AND (' + s + ')'
    return s;
  }

  private getOrderByExpression4Query(filter: TableFiltering, orderBy: string, orderDirection: string, ui2Db: any) {
    if (filter != null && filter.orderDirection.length > 0 && filter.orderBy.length > 0) {
      orderBy = ui2Db[filter.orderBy];
      orderDirection = filter.orderDirection;
    }
    return orderBy + ' ' + orderDirection;
  }

  private buildIdFilter(ids: string[] | number[]): string {
    if (ids === undefined) {
      return '';
    }
    let cql = '';
    if (ids.length > 0) {
      cql = '(';
    }
    for (let i = 0; i < ids.length; i++) {
      cql += `ID(n)=${ids[i]} OR `
    }

    if (ids.length > 0) {
      cql = cql.slice(0, -4);
      cql += ') AND ';
    }
    return cql;
  }

  // ------------------------------------------------- end of methods for conversion to CQL -------------------------------------------------

}
