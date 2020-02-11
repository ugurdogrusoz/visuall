import { Injectable } from '@angular/core';
import { DbService, GraphResponse, TableResponse, DbQueryType } from './data-types';
import { Neo4jDb } from './neo4j-db.service';
import { ClassBasedRules } from '../operation-tabs/map-tab/filtering-types';

@Injectable({
  providedIn: 'root'
})
// functions that are not defined due to interface DbService might be deleted
export class DbAdapterService implements DbService {
  // put prefered database service type as argument 
  constructor(private _db: Neo4jDb) {
  }

  // ----------------------- DbService interface methods starts -------------------------------
  getNeighbors(elemId: string[]|number[], callback: (x: GraphResponse) => any) {
    this._db.getNeighbors(elemId, callback);
  }

  getSampleData(callback: (x: GraphResponse) => any) {
    this._db.getSampleData(callback);
  }

  getAllData(callback: (x: GraphResponse) => any) {
    this._db.getAllData(callback);
  }

  getFilteringResult(rules: ClassBasedRules, skip: number, limit: number, type: DbQueryType, callback: (x: GraphResponse | TableResponse) => any) {
    this._db.getFilteringResult(rules, skip, limit, type, callback);
  }
  // ----------------------- DbService interface methods ends -------------------------------

  getCount4Q0(d1: number, d2: number, movieCount: number, callback: (x) => any) {
    this._db.getCount4Q0(d1, d2, movieCount, callback);
  }

  getTable4Q0(d1: number, d2: number, movieCnt: number, skip: number, limit: number, callback: (x) => any) {
    this._db.getTable4Q0(d1, d2, movieCnt, skip, limit, callback);
  }

  getGraph4Q0(d1: number, d2: number, movieCnt: number, skip: number, limit: number, callback: (x) => any) {
    this._db.getGraph4Q0(d1, d2, movieCnt, skip, limit, callback);
  }

  getDataForQ0(id: number, d1: number, d2: number, callback: (x) => any) {
    this._db.getDataForQ0(id, d1, d2, callback);
  }

  getCount4Q1(d1: number, d2: number, genre: string, callback: (x) => any) {
    this._db.getCount4Q1(d1, d2, genre, callback);
  }

  getTable4Q1(d1: number, d2: number, genre: string, skip: number, limit: number, callback: (x) => any) {
    this._db.getTable4Q1(d1, d2, genre, skip, limit, callback);
  }

  getGraph4Q1(d1: number, d2: number, genre: string, skip: number, limit: number, callback: (x) => any) {
    this._db.getGraph4Q1(d1, d2, genre, skip, limit, callback);
  }

  getDataForQ1(id: number, d1: number, d2: number, genre: string, callback: (x) => any){
    this._db.getDataForQ1(id, d1, d2, genre, callback);
  }

  getMovieGenres(callback: (x: any) => any) {
    this._db.getMovieGenres(callback);
  }

}
