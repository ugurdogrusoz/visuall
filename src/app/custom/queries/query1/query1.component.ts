import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Neo4jDb } from '../../../visuall/db-service/neo4j-db.service';
import { CytoscapeService } from '../../../visuall/cytoscape.service';
import { GlobalVariableService } from '../../../visuall/global-variable.service';
import flatpickr from 'flatpickr';
import { TableViewInput, TableDataType, TableFiltering, TableRowMeta } from '../../../shared/table-view/table-view-types';
import { Subject } from 'rxjs';
import { buildIdFilter, getOrderByExpression4Query, getQueryCondition4TxtFilter } from '../query-helper';

@Component({
  selector: 'app-query1',
  templateUrl: './query1.component.html',
  styleUrls: ['./query1.component.css']
})
export class Query1Component implements OnInit, AfterViewInit {

  selectedGenre: string;
  movieGenres: string[];
  tableInput: TableViewInput = {
    columns: ['Title'], results: [], isEmphasizeOnHover: true, tableTitle: 'Query Results', classNameOfObjects: 'Title',
    resultCnt: 0, currPage: 1, pageSize: 0, isLoadGraph: true, isMergeGraph: true, isNodeData: true
  };
  tableFilled = new Subject<boolean>();
  date1Id = 'query1-inp0';
  date2Id = 'query1-inp1';

  constructor(private _dbService: Neo4jDb, private _cyService: CytoscapeService, private _g: GlobalVariableService) {
    this.movieGenres = [];
  }

  ngOnInit() {
    this.selectedGenre = 'Action';
    setTimeout(() => {
      this._dbService.runQuery('MATCH (m:Title) UNWIND m.genres as g return distinct g', (x) => this.fillGenres(x), false);
    }, 0);
    this.tableInput.results = [];
    this._g.userPrefs.dataPageSize.subscribe(x => { this.tableInput.pageSize = x; });
  }

  ngAfterViewInit(): void {
    let opt = {
      defaultDate: new Date(1960, 0, 1, 0, 0, 0), enableTime: true, enableSeconds: true, time_24hr: true,
      minDate: this._g.userPrefs.dbQueryTimeRange.start.getValue(),
      maxDate: this._g.userPrefs.dbQueryTimeRange.end.getValue(),
    };
    let opt2 = {
      defaultDate: new Date(1969, 11, 31, 0, 0, 0), enableTime: true, enableSeconds: true, time_24hr: true,
      minDate: this._g.userPrefs.dbQueryTimeRange.start.getValue(),
      maxDate: this._g.userPrefs.dbQueryTimeRange.end.getValue(),
    };

    flatpickr('#' + this.date1Id, opt);
    flatpickr('#' + this.date2Id, opt2);
  }

  prepareQuery() {
    const d1 = document.querySelector('#' + this.date1Id)['_flatpickr'].selectedDates[0].getFullYear();
    const d2 = document.querySelector('#' + this.date2Id)['_flatpickr'].selectedDates[0].getFullYear();
    const skip = (this.tableInput.currPage - 1) * this.tableInput.pageSize;

    this.getCountOfData(d1, d2);
    this.loadTable(d1, d2, skip);
    this.loadGraph(d1, d2, skip);
  }

  getCountOfData(d1: number, d2: number, filter?: TableFiltering) {
    const cb = (x) => { this.tableInput.resultCnt = x.data[0]; }
    const txtCondition = getQueryCondition4TxtFilter(filter, ['m.primary_title']);
    const cql = ` MATCH (m:Title)<-[:ACTOR|ACTRESS]-(:Person)
    WHERE '${this.selectedGenre}' IN m.genres AND m.start_year> ${d1} AND m.start_year < ${d2} ${txtCondition} 
    RETURN COUNT( DISTINCT m)`;
    this._dbService.runQuery(cql, cb, false);
  }

  loadTable(d1: number, d2: number, skip: number, filter?: TableFiltering) {
    const cb = (x) => this.fillTable(x);
    const txtCondition = getQueryCondition4TxtFilter(filter, ['m.primary_title']);
    const ui2Db = { 'Title': 'm.primary_title' };
    const orderExpr = getOrderByExpression4Query(filter, 'm.primary_title', 'desc', ui2Db);

    const cql = ` MATCH (m:Title)<-[r:ACTOR|ACTRESS]-(:Person)
    WHERE '${this.selectedGenre}' IN m.genres AND m.start_year > ${d1} AND m.start_year < ${d2} ${txtCondition} 
    RETURN DISTINCT ID(m) as id, m.primary_title
    ORDER BY ${orderExpr} SKIP ${skip} LIMIT ${this.tableInput.pageSize}`;
    this._dbService.runQuery(cql, cb, false);
  }

  loadGraph(d1: number, d2: number, skip: number, filter?: TableFiltering) {
    if (!this.tableInput.isLoadGraph) {
      return;
    }
    const cb = (x) => this._cyService.loadElementsFromDatabase(x, this.tableInput.isMergeGraph)
    const txtCondition = getQueryCondition4TxtFilter(filter, ['n.primary_title']);
    const ui2Db = { 'Title': 'n.primary_title' };
    const orderExpr = getOrderByExpression4Query(filter, 'n.primary_title', 'desc', ui2Db);

    const cql = `MATCH (n:Title)<-[r:ACTOR|ACTRESS]-(:Person)
    WHERE '${this.selectedGenre}' IN n.genres AND n.start_year > ${d1} AND n.start_year < ${d2}  ${txtCondition}
    WITH n, COLLECT(r) as edges
    RETURN  DISTINCT n, edges
    ORDER BY ${orderExpr} SKIP ${skip} LIMIT ${this.tableInput.pageSize}`;
    this._dbService.runQuery(cql, cb);
  }

  fillTable(data) {
    this.tableInput.results = [];
    for (let i = 0; i < data.data.length; i++) {
      const d = data.data[i];
      this.tableInput.results.push([{ type: TableDataType.number, val: d[0] }, { type: TableDataType.string, val: d[1] }]);
    }
    this.tableFilled.next(true);
  }

  fillGenres(data) {
    this.movieGenres = [];
    for (let i = 0; i < data.data.length; i++) {
      this.movieGenres.push(data.data[i]);
    }
  }

  getDataForQueryResult(e: TableRowMeta) {
    let d1 = document.querySelector('#' + this.date1Id)['_flatpickr'].selectedDates[0].getFullYear();
    let d2 = document.querySelector('#' + this.date2Id)['_flatpickr'].selectedDates[0].getFullYear();
    const cb = (x) => this._cyService.loadElementsFromDatabase(x, this.tableInput.isMergeGraph)

    let idFilter = buildIdFilter(e.dbIds, true);
    let ui2Db = { 'Title': 'n.primary_title' };
    let orderExpr = getOrderByExpression4Query(null, 'n.primary_title', 'desc', ui2Db);

    let cql = `MATCH (n:Title)<-[r:ACTOR|ACTRESS]-(:Person)
      WHERE '${this.selectedGenre}' IN n.genres AND ${idFilter}  n.start_year > ${d1} AND n.start_year < ${d2}
      WITH n, COLLECT(r) as edges
      RETURN  DISTINCT n, edges
      ORDER BY ${orderExpr} SKIP 0 LIMIT ${this.tableInput.pageSize}`;
    this._dbService.runQuery(cql, cb);
  }

  filterTable(filter: TableFiltering) {
    this.tableInput.currPage = 1;
    let d1 = document.querySelector('#' + this.date1Id)['_flatpickr'].selectedDates[0].getFullYear();
    let d2 = document.querySelector('#' + this.date2Id)['_flatpickr'].selectedDates[0].getFullYear();
    this.getCountOfData(d1, d2, filter);
    let skip = filter.skip ? filter.skip : 0;
    this.loadTable(d1, d2, skip, filter);
    if (this.tableInput.isLoadGraph) {
      this.loadGraph(d1, d2, skip, filter);
    }
  }
}