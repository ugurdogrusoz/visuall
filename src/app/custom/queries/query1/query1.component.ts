import { Component, OnInit } from '@angular/core';
import { Neo4jDb } from '../../../visuall/db-service/neo4j-db.service';
import { CytoscapeService } from '../../../visuall/cytoscape.service';
import { GlobalVariableService } from '../../../visuall/global-variable.service';
import { TableViewInput, TableDataType, TableFiltering, TableRowMeta } from '../../../shared/table-view/table-view-types';
import { Subject } from 'rxjs';
import { buildIdFilter, getOrderByExpression4Query, getQueryCondition4TxtFilter } from '../query-helper';
import { DbResponseType } from 'src/app/visuall/db-service/data-types';

@Component({
  selector: 'app-query1',
  templateUrl: './query1.component.html',
  styleUrls: ['./query1.component.css']
})
export class Query1Component implements OnInit {

  selectedGenre: string;
  movieGenres: string[];
  tableInput: TableViewInput = {
    columns: ['Title'], results: [], isEmphasizeOnHover: true, tableTitle: 'Query Results', classNameOfObjects: 'Title', isShowExportAsCSV: true,
    resultCnt: 0, currPage: 1, pageSize: 0, isLoadGraph: false, isMergeGraph: true, isNodeData: true
  };
  tableFilled = new Subject<boolean>();

  constructor(private _dbService: Neo4jDb, private _cyService: CytoscapeService, private _g: GlobalVariableService) {
    this.movieGenres = [];
  }

  ngOnInit() {
    this.selectedGenre = 'Action';
    setTimeout(() => {
      this._dbService.runQuery('MATCH (m:Title) UNWIND m.genres as g return distinct g', (x) => this.fillGenres(x), DbResponseType.table);
    }, 0);
    this.tableInput.results = [];
    this._g.userPrefs.dataPageSize.subscribe(x => { this.tableInput.pageSize = x; });
  }

  prepareQuery() {
    const skip = (this.tableInput.currPage - 1) * this.tableInput.pageSize;
    this.loadTable(skip);
    this.loadGraph(skip);
  }

  loadTable(skip: number, filter?: TableFiltering) {
    const cb = (x) => this.fillTable(x);
    const isIgnoreCase = this._g.userPrefs.isIgnoreCaseInText.getValue();
    const txtCondition = getQueryCondition4TxtFilter(filter, ['n.primary_title'], isIgnoreCase);
    const ui2Db = { 'Title': 'n.primary_title' };
    const orderExpr = getOrderByExpression4Query(filter, 'n.primary_title', 'desc', ui2Db);
    const dateFilter = this.getDateRangeCQL();
    const r = `[${skip}..${skip + this.tableInput.pageSize}]`;

    const cql = ` MATCH (n:Title)<-[r:ACTOR|ACTRESS]-(:Person)
    WHERE '${this.selectedGenre}' IN n.genres AND ${dateFilter} ${txtCondition} 
    WITH DISTINCT n ORDER BY ${orderExpr}
    RETURN collect(ID(n))${r} as id, collect(n.primary_title)${r} as title, size(collect(ID(n))) as totalDataCount`;
    this._dbService.runQuery(cql, cb, DbResponseType.table);
  }

  loadGraph(skip: number, filter?: TableFiltering) {
    if (!this.tableInput.isLoadGraph) {
      return;
    }
    const cb = (x) => this._cyService.loadElementsFromDatabase(x, this.tableInput.isMergeGraph);
    const isIgnoreCase = this._g.userPrefs.isIgnoreCaseInText.getValue();
    const txtCondition = getQueryCondition4TxtFilter(filter, ['n.primary_title'], isIgnoreCase);
    const ui2Db = { 'Title': 'n.primary_title' };
    const orderExpr = getOrderByExpression4Query(filter, 'n.primary_title', 'desc', ui2Db);
    const dateFilter = this.getDateRangeCQL();

    const cql = `MATCH (n:Title)<-[r:ACTOR|ACTRESS]-(:Person)
    WHERE '${this.selectedGenre}' IN n.genres AND ${dateFilter} ${txtCondition}
    WITH DISTINCT n, COLLECT(r) as edges
    RETURN  n, edges
    ORDER BY ${orderExpr} SKIP ${skip} LIMIT ${this.tableInput.pageSize}`;
    this._dbService.runQuery(cql, cb);
  }

  fillTable(data) {
    const rawData = data.data[0];
    this.tableInput.results = [];
    for (let i = 0; i < rawData[0].length; i++) {
      this.tableInput.results.push([{ type: TableDataType.number, val: rawData[0][i] }, { type: TableDataType.string, val: rawData[1][i] }]);
    }
    this.tableInput.resultCnt = rawData[2];
    this.tableFilled.next(true);
  }

  fillGenres(data) {
    this.movieGenres = [];
    for (let i = 0; i < data.data.length; i++) {
      this.movieGenres.push(data.data[i]);
    }
  }

  getDataForQueryResult(e: TableRowMeta) {
    let d1 = this._g.userPrefs.dbQueryTimeRange.start.getValue();
    let d2 = this._g.userPrefs.dbQueryTimeRange.end.getValue();
    const cb = (x) => this._cyService.loadElementsFromDatabase(x, this.tableInput.isMergeGraph)

    let idFilter = buildIdFilter(e.dbIds, true);
    let ui2Db = { 'Title': 'n.primary_title' };
    let orderExpr = getOrderByExpression4Query(null, 'n.primary_title', 'desc', ui2Db);

    let cql = `MATCH (n:Title)<-[r:ACTOR|ACTRESS]-(:Person)
      WHERE '${this.selectedGenre}' IN n.genres AND ${idFilter}  n.production_start_date > ${d1} AND n.production_end_date < ${d2}
      WITH n, COLLECT(r) as edges
      RETURN  DISTINCT n, edges
      ORDER BY ${orderExpr} SKIP 0 LIMIT ${this.tableInput.pageSize}`;
    this._dbService.runQuery(cql, cb);
  }

  filterTable(filter: TableFiltering) {
    this.tableInput.currPage = 1;
    let skip = filter.skip ? filter.skip : 0;
    this.loadTable(skip, filter);
    if (this.tableInput.isLoadGraph) {
      this.loadGraph(skip, filter);
    }
  }

  private getDateRangeCQL() {
    const isLimit = this._g.userPrefs.isLimitDbQueries2range.getValue();
    if (!isLimit) {
      return 'TRUE';
    }
    const d1 = this._g.userPrefs.dbQueryTimeRange.start.getValue();
    const d2 = this._g.userPrefs.dbQueryTimeRange.end.getValue();
    return `n.production_start_date > ${d1} AND n.production_end_date < ${d2}`;
  }
}