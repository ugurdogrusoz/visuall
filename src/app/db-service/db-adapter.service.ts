import { Injectable } from '@angular/core';
import { DbService, GraphResponse, TableResponse, DbQueryType } from './data-types';
import { Neo4jDb } from './neo4j-db.service';
import { ClassBasedRules } from '../operation-tabs/map-tab/filtering-types';
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
  getNeighbors(elemId: string[] | number[], callback: (x: GraphResponse) => any) {
    let s = this._g.getLabels4Elems(elemId);
    let fn = (x) => { callback(x); this._g.add2GraphHistory('Get neighbors of element(s): ' + s); };
    this._db.getNeighbors(elemId, fn);
  }

  getSampleData(callback: (x: GraphResponse) => any) {
    let fn = (x) => { callback(x); this._g.add2GraphHistory('Get sample data'); };
    this._db.getSampleData(fn);
  }

  getAllData(callback: (x: GraphResponse) => any) {
    let fn = (x) => { callback(x); this._g.add2GraphHistory('Get all data'); };
    this._db.getAllData(fn);
  }

  getFilteringResult(rules: ClassBasedRules, skip: number, limit: number, type: DbQueryType, callback: (x: GraphResponse | TableResponse) => any) {
    if (type == DbQueryType.std) {
      let fn = (x) => { callback(x); this._g.add2GraphHistory('Get filtering result'); };
      this._db.getFilteringResult(rules, skip, limit, type, fn);
    } else {
      this._db.getFilteringResult(rules, skip, limit, type, callback);
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

  getGraph4Q0(d1: number, d2: number, movieCnt: number, skip: number, limit: number, callback: (x) => any, ids?: number[] | string[]) {
    let fn = (x) => { callback(x); this._g.add2GraphHistory('Get query 0 results'); };
    this._db.getGraph4Q0(d1, d2, movieCnt, skip, limit, fn, ids);
  }

  getCount4Q1(d1: number, d2: number, genre: string, callback: (x) => any, filter?: TableFiltering) {
    this._db.getCount4Q1(d1, d2, genre, callback, filter);
  }

  getTable4Q1(d1: number, d2: number, genre: string, skip: number, limit: number, callback: (x) => any, filter?: TableFiltering) {
    this._db.getTable4Q1(d1, d2, genre, skip, limit, callback, filter);
  }

  getGraph4Q1(d1: number, d2: number, genre: string, skip: number, limit: number, callback: (x) => any, ids?: number[] | string[]) {
    let fn = (x) => { callback(x); this._g.add2GraphHistory('Get query 1 results'); };
    this._db.getGraph4Q1(d1, d2, genre, skip, limit, fn, ids);
  }

  getMovieGenres(callback: (x: any) => any) {
    this._db.getMovieGenres(callback);
  }

}
