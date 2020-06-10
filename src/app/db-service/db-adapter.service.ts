import { Injectable } from '@angular/core';
import { DbService, GraphResponse, TableResponse, DbQueryType, HistoryMetaData, DbQueryMeta } from './data-types';
import { Neo4jDb } from './neo4j-db.service';
import { ClassBasedRules, rule2str } from '../operation-tabs/map-tab/query-types';
import { TableFiltering } from '../table-view/table-view-types';
import { GlobalVariableService } from '../global-variable.service';

@Injectable({
  providedIn: 'root'
})
// functions that are not defined due to interface DbService might be deleted
export class DbAdapterService implements DbService {
  // put prefered database service type as argument 
  constructor(private _db: Neo4jDb, private _g: GlobalVariableService) {
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
    this._db.getNeighbors(elemId, fn, queryMeta);
  }

  getSampleData(callback: (x: GraphResponse) => any) {
    let fn = (x) => { callback(x); this._g.add2GraphHistory('Get sample data'); };
    this._db.getSampleData(fn);
  }

  getFilteringResult(rules: ClassBasedRules, filter: TableFiltering, skip: number, limit: number, type: DbQueryType, callback: (x: GraphResponse | TableResponse) => any) {
    if (type == DbQueryType.std) {
      let s = 'Get ' + rule2str(rules);
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

  getCount4Q0(d1: number, d2: number, movieCount: number, callback: (x) => any, filter?: TableFiltering) {
    this._db.getCount4Q0(d1, d2, movieCount, callback, filter);
  }

  getTable4Q0(d1: number, d2: number, movieCnt: number, skip: number, limit: number, callback: (x) => any, filter?: TableFiltering) {
    this._db.getTable4Q0(d1, d2, movieCnt, skip, limit, callback, filter);
  }

  getGraph4Q0(d1: number, d2: number, movieCnt: number, skip: number, limit: number, callback: (x) => any, ids?: number[] | string[], idxes?: number[], filter?: TableFiltering) {
    let s = `Get actors by title counts with: "${new Date(d1).toLocaleString()}", "${new Date(d2).toLocaleString()}", "${movieCnt}"`;
    if (idxes) {
      s += ', ' + idxes.join(',');
    }
    let fn = (x) => { callback(x); this._g.add2GraphHistory(s); };
    this._db.getGraph4Q0(d1, d2, movieCnt, skip, limit, fn, ids, filter);
  }

  getCount4Q1(d1: number, d2: number, genre: string, callback: (x) => any, filter?: TableFiltering) {
    this._db.getCount4Q1(d1, d2, genre, callback, filter);
  }

  getTable4Q1(d1: number, d2: number, genre: string, skip: number, limit: number, callback: (x) => any, filter?: TableFiltering) {
    this._db.getTable4Q1(d1, d2, genre, skip, limit, callback, filter);
  }

  getGraph4Q1(d1: number, d2: number, genre: string, skip: number, limit: number, callback: (x) => any, ids?: number[] | string[], idxes?: number[], filter?: TableFiltering) {
    let s = `Get titles by genre with parameters: "${d1}", "${d2}", "${genre}"`;
    if (idxes) {
      s += ', ' + idxes.join(',');
    }
    let fn = (x) => { callback(x); this._g.add2GraphHistory(s); };
    this._db.getGraph4Q1(d1, d2, genre, skip, limit, fn, ids, filter);
  }

  getMovieGenres(callback: (x: any) => any) {
    this._db.getMovieGenres(callback);
  }

}
