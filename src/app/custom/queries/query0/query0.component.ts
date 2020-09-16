import { Component, OnInit } from '@angular/core';
import { Neo4jDb } from '../../../visuall/db-service/neo4j-db.service';
import { CytoscapeService } from '../../../visuall/cytoscape.service';
import { GlobalVariableService } from '../../../visuall/global-variable.service';
import flatpickr from 'flatpickr';
import { TableViewInput, TableDataType, TableFiltering, TableRowMeta } from '../../../shared/table-view/table-view-types';
import { Subject } from 'rxjs';
import { buildIdFilter, getOrderByExpression4Query, getQueryCondition4TxtFilter } from '../query-helper';


@Component({
  selector: 'app-query0',
  templateUrl: './query0.component.html',
  styleUrls: ['./query0.component.css']
})
export class Query0Component implements OnInit {
  movieCnt: number;
  tableFilled = new Subject<boolean>();

  tableInput: TableViewInput = {
    columns: ['Actor', 'Count'], results: [], tableTitle: 'Query Results', isEmphasizeOnHover: true, classNameOfObjects: 'Person',
    resultCnt: 0, currPage: 1, pageSize: 0, isLoadGraph: true, isMergeGraph: true, isNodeData: true
  };

  constructor(private _dbService: Neo4jDb, private _cyService: CytoscapeService, private _g: GlobalVariableService) {
  }

  ngOnInit() {
    this.movieCnt = 40;
    let opt = {
      defaultDate: new Date(1960, 0, 1, 0, 0, 0), enableTime: true, enableSeconds: true, time_24hr: true,
      minDate: this._g.userPrefs.dbQueryTimeRange.start.getValue(),
      maxDate: this._g.userPrefs.dbQueryTimeRange.end.getValue(),
    };
    let opt2 = {
      defaultDate: new Date(2020, 11, 31, 0, 0, 0), enableTime: true, enableSeconds: true, time_24hr: true,
      minDate: this._g.userPrefs.dbQueryTimeRange.start.getValue(),
      maxDate: this._g.userPrefs.dbQueryTimeRange.end.getValue(),
    };

    flatpickr('#query0-inp1', opt);
    flatpickr('#query0-inp2', opt2);
    this._g.userPrefs.dataPageSize.subscribe(x => { this.tableInput.pageSize = x; });
  }

  prepareQuery() {

    let d1 = document.querySelector('#query0-inp1')['_flatpickr'].selectedDates[0].getTime();
    let d2 = document.querySelector('#query0-inp2')['_flatpickr'].selectedDates[0].getTime();
    let skip = (this.tableInput.currPage - 1) * this.tableInput.pageSize;

    this.getCountOfData(d1, d2);
    this.loadTable(d1, d2, skip);
    this.loadGraph(d1, d2, skip);
  }

  getCountOfData(d1: number, d2: number, filter?: TableFiltering) {
    const cb = (x) => { this.tableInput.resultCnt = x.data[0] };
    let txtCondition = getQueryCondition4TxtFilter(filter, ['n.primary_name', 'degree']);
    let cql = `MATCH (n:Person)-[r:ACTOR|ACTRESS]->(:Title)
    WHERE r.act_begin >= ${d1} AND r.act_end <= ${d2}  
    WITH n, SIZE(COLLECT(r)) as degree
    WHERE degree >= ${this.movieCnt} ${txtCondition}
    RETURN DISTINCT COUNT(*)`;
    this._dbService.runQuery(cql, cb, false);
  }

  loadTable(d1: number, d2: number, skip: number, filter?: TableFiltering) {
    const cb = (x) => this.fillTable(x);
    let txtCondition = getQueryCondition4TxtFilter(filter, ['n.primary_name', 'degree']);
    let ui2Db = { 'Actor': 'Actor', 'Count': 'Count' };
    let orderExpr = getOrderByExpression4Query(filter, 'degree', 'desc', ui2Db);

    let cql = `MATCH (n:Person)-[r:ACTOR|ACTRESS]->(:Title)
    WHERE r.act_begin >= ${d1} AND r.act_end <= ${d2}  
    WITH n, SIZE(COLLECT(r)) as degree
    WHERE degree >= ${this.movieCnt} ${txtCondition}
    RETURN DISTINCT ID(n) as id, n.primary_name as Actor, degree as Count 
    ORDER BY ${orderExpr} SKIP ${skip} LIMIT ${this.tableInput.pageSize}`;
    this._dbService.runQuery(cql, cb, false);
  }

  loadGraph(d1: number, d2: number, skip: number, filter?: TableFiltering) {
    if (!this.tableInput.isLoadGraph) {
      return;
    }
    let cb = (x) => this._cyService.loadElementsFromDatabase(x, this.tableInput.isMergeGraph);

    let txtCondition = getQueryCondition4TxtFilter(filter, ['n.primary_name', 'degree']);
    let ui2Db = { 'Actor': 'n.primary_name', 'Count': 'degree' };
    let orderExpr = getOrderByExpression4Query(filter, 'degree', 'desc', ui2Db);

    let cql = `MATCH (n:Person)-[r:ACTOR|ACTRESS]->(:Title)
      WHERE r.act_begin >= ${d1} AND r.act_end <= ${d2}  
      WITH n, SIZE(COLLECT(r)) as degree, COLLECT(r) as edges
      WHERE degree >= ${this.movieCnt} ${txtCondition}
      RETURN DISTINCT n, edges, degree 
      ORDER BY ${orderExpr} SKIP ${skip} LIMIT ${this.tableInput.pageSize}`;
    this._dbService.runQuery(cql, cb);
  }

  fillTable(data) {
    this.tableInput.results = [];
    for (let i = 0; i < data.data.length; i++) {
      const d = data.data[i];
      this.tableInput.results.push([{ type: TableDataType.number, val: d[0] }, { type: TableDataType.string, val: d[1] }, { type: TableDataType.number, val: d[2] }]);
    }
    this.tableFilled.next(true);
  }

  getDataForQueryResult(e: TableRowMeta) {
    let d1 = document.querySelector('#query0-inp1')['_flatpickr'].selectedDates[0].getTime();
    let d2 = document.querySelector('#query0-inp2')['_flatpickr'].selectedDates[0].getTime();
    let s = `Get actors by title counts with: "${new Date(d1).toLocaleString()}", "${new Date(d2).toLocaleString()}", "${this.movieCnt}"`;
    if (e.tableIdx) {
      s += ', ' + e.tableIdx.join(',');
    }
    let cb = (x) => { this._cyService.loadElementsFromDatabase(x, this.tableInput.isMergeGraph); this._g.add2GraphHistory(s); };

    let idFilter = buildIdFilter(e.dbIds, true);
    let txtCondition = getQueryCondition4TxtFilter(null, ['n.primary_name', 'degree']);
    let ui2Db = { 'Actor': 'n.primary_name', 'Count': 'degree' };
    let orderExpr = getOrderByExpression4Query(null, 'degree', 'desc', ui2Db);

    let cql = `MATCH (n:Person)-[r:ACTOR|ACTRESS]->(:Title)
      WHERE ${idFilter} r.act_begin >= ${d1} AND r.act_end <= ${d2}  
      WITH n, SIZE(COLLECT(r)) as degree, COLLECT(r) as edges
      WHERE degree >= ${this.movieCnt} ${txtCondition}
      RETURN DISTINCT n, edges, degree 
      ORDER BY ${orderExpr} SKIP 0 LIMIT ${this.tableInput.pageSize}`;
    this._dbService.runQuery(cql, cb);

  }

  filterTable(filter: TableFiltering) {
    this.tableInput.currPage = 1;
    let d1 = document.querySelector('#query0-inp1')['_flatpickr'].selectedDates[0].getTime();
    let d2 = document.querySelector('#query0-inp2')['_flatpickr'].selectedDates[0].getTime();
    this.getCountOfData(d1, d2, filter);
    let skip = filter.skip ? filter.skip : 0;
    this.loadTable(d1, d2, skip, filter);
    if (this.tableInput.isLoadGraph) {
      this.loadGraph(d1, d2, skip, filter);
    }
  }
}