import { Injectable } from '@angular/core';
import { DbService, GraphResponse, TableResponse, DbQueryType } from './data-types';
import { Neo4jDb } from './neo4j-db.service';
import { ClassBasedRules, rule2str } from '../operation-tabs/map-tab/filtering-types';
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
  getNeighbors(elemId: string[] | number[], callback: (x: GraphResponse) => any, labels: string = null, isNode: boolean = true, customTxt: string = null) {
    let s = labels;
    if (!labels) {
      s = this._g.getLabels4Elems(elemId, isNode);
    }
    let txt = 'Get neighbors of element(s): ';
    if (customTxt) {
      txt = customTxt;
    }
    let fn = (x) => { callback(x); this._g.add2GraphHistory(txt + s); };
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
      let s = 'Get ' + rule2str(rules);
      let fn = (x) => { callback(x); this._g.add2GraphHistory(s); };
      this._db.getFilteringResult(rules, skip, limit, type, fn);
    } else {
      this._db.getFilteringResult(rules, skip, limit, type, callback);
    }
  }

  filterTable(rules: ClassBasedRules, filter: TableFiltering, skip: number, limit: number, type: DbQueryType, callback: (x: GraphResponse | TableResponse) => any) {
    this._db.filterTable(rules, filter, skip, limit, type, callback);
  }
  // ----------------------- DbService interface methods ends -------------------------------

  

}
