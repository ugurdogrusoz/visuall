import { Injectable } from '@angular/core';
import { DbService, GraphResponse, TableResponse, DbQueryType, HistoryMetaData, DbQueryMeta, Neo4jEdgeDirection } from './data-types';
import { Neo4jDb } from './neo4j-db.service';
import { ClassBasedRules, rule2str2 } from '../operation-tabs/map-tab/query-types';
import { TableFiltering } from '../table-view/table-view-types';
import { GlobalVariableService } from '../global-variable.service';
import { SparqlDbService } from './sparql-db.service';

@Injectable({
  providedIn: 'root'
})
// functions that are not defined due to interface DbService might be deleted
export class DbAdapterService implements DbService {
  // put prefered database service type as argument
  constructor(private _db: SparqlDbService, private _g: GlobalVariableService) {
  }

  // ----------------------- DbService interface methods starts -------------------------------
  getNeighbors(elemId: string[] | number[], callback: (x: GraphResponse) => any, historyMeta?: HistoryMetaData, queryMeta?: DbQueryMeta) {
    let s = '';
    if (historyMeta) {
      s = historyMeta.labels;
      if (!historyMeta.labels) {
        s = this._g.getLabels4Elems(elemId, historyMeta.isNode);
      }
    }

    let txt = 'Get neighbors of element(s): ';
    if (historyMeta && historyMeta.customTxt) {
      txt = historyMeta.customTxt;
    }
    let fn = (x) => { callback(x); this._g.add2GraphHistory(txt + s); };
    this._db.getNeighbors(elemId, fn);
  }

  getElems(ids: string[] | number[], callback: (x: GraphResponse) => any, queryMeta: DbQueryMeta, historyMeta?: HistoryMetaData,) {
    let s = '';
    if (historyMeta) {
      s = historyMeta.labels;
      if (!historyMeta.labels) {
        s = this._g.getLabels4Elems(ids, historyMeta.isNode);
      }
    }

    let txt = 'Get neighbors of element(s): ';
    if (historyMeta && historyMeta.customTxt) {
      txt = historyMeta.customTxt;
    }
    let fn = (x) => { callback(x); this._g.add2GraphHistory(txt + s); };
    this._db.getElems(ids, fn, queryMeta);
  }

  getSampleData(callback: (x: GraphResponse) => any) {
    let fn = (x) => { callback(x); this._g.add2GraphHistory('Get sample data'); };
    this._db.getSampleData(fn);
  }

  getAllData(callback: (x: GraphResponse) => any) {
    let fn = (x) => { callback(x); this._g.add2GraphHistory('Get all data'); };
    this._db.getAllData(fn);
  }

  getFilteringResult(rules: ClassBasedRules, filter: TableFiltering, skip: number, limit: number, type: DbQueryType, callback: (x: GraphResponse | TableResponse) => any) {
    if (type == DbQueryType.std) {
      let s = 'Get ' + rule2str2(rules);
      let fn = (x) => { callback(x); this._g.add2GraphHistory(s); };
      this._db.getFilteringResult(rules, filter, skip, limit, type, fn);
    } else {
      this._db.getFilteringResult(rules, filter, skip, limit, type, callback);
    }
  }

  filterTable(rules: ClassBasedRules, filter: TableFiltering, skip: number, limit: number, type: DbQueryType, callback: (x: GraphResponse | TableResponse) => any) {
    this._db.filterTable(rules, filter, skip, limit, type, callback);
  }
  // ----------------------- DbService interface methods ends -------------------------------



  getGraphOfInterest(dbIds: (string | number)[], ignoredTypes: string[], lengthLimit: number, isDirected: boolean, type: DbQueryType, filter: TableFiltering, cb: (x) => void) {
    let fn = cb;
    if (type == DbQueryType.table) {
      fn = (x) => { cb(x); this._g.add2GraphHistory(`Graph of interest`); };
    }
    this._db.getGraphOfInterest(dbIds, ignoredTypes, lengthLimit, isDirected, type, filter, fn);
  }

  getCommonStream(dbIds: (string | number)[], ignoredTypes: string[], lengthLimit: number, dir: Neo4jEdgeDirection, type: DbQueryType, filter: TableFiltering, cb: (x) => void) {
    let fn = cb;
    if (type == DbQueryType.table) {
      fn = (x) => { cb(x); this._g.add2GraphHistory(`Common target/regulator`); };
    }
    this._db.getCommonStream(dbIds, ignoredTypes, lengthLimit, dir, type, filter, fn);
  }
}
