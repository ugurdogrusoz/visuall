import { Component, OnInit } from '@angular/core';
import { Neo4jDb } from '../../../visuall/db-service/neo4j-db.service';
import { CytoscapeService } from '../../../visuall/cytoscape.service';
import { GlobalVariableService } from '../../../visuall/global-variable.service';
import { TableViewInput, TableDataType, TableFiltering, TableRowMeta } from '../../../shared/table-view/table-view-types';
import { Subject } from 'rxjs';
import { buildIdFilter, getOrderByExpression4Query, getQueryCondition4TxtFilter } from '../query-helper';
import { DbResponseType } from 'src/app/visuall/db-service/data-types';


@Component({
  selector: 'app-query0',
  templateUrl: './query0.component.html',
  styleUrls: ['./query0.component.css']
})
export class Query0Component implements OnInit {
  movieCnt: number;
  tableFilled = new Subject<boolean>();

  tableInput: TableViewInput = {
    columns: ['Actor', 'Count'], results: [], tableTitle: 'Query Results', isEmphasizeOnHover: true, classNameOfObjects: 'Person', isShowExportAsCSV: true,
    resultCnt: 0, currPage: 1, pageSize: 0, isLoadGraph: false, isMergeGraph: true, isNodeData: true
  };

  constructor(private _dbService: Neo4jDb, private _cyService: CytoscapeService, private _g: GlobalVariableService) {
  }

  ngOnInit() {
    this.movieCnt = 40;
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
    const txtCondition = getQueryCondition4TxtFilter(filter, ['n.primary_name', 'degree'], isIgnoreCase);
    const ui2Db = { 'Actor': 'Actor', 'Count': 'Count' };
    const orderExpr = getOrderByExpression4Query(filter, 'degree', 'desc', ui2Db);
    const dateFilter = this.getDateRangeCQL();
    const r = `[${skip}..${skip + this.tableInput.pageSize}]`;
    const cql = `MATCH (n:Person)-[r:ACTOR|ACTRESS]->(:Title)
    WHERE ${dateFilter}
    WITH n, SIZE(COLLECT(r)) as degree
    WHERE degree >= ${this.movieCnt} ${txtCondition}
    WITH n, degree ORDER BY ${orderExpr}
    RETURN collect(ID(n))${r} as id, collect(n.primary_name)${r} as Actor, collect(degree)${r} as Count, size(collect(ID(n))) as totalDataCount`;
    this._dbService.runQuery(cql, cb, DbResponseType.table);
  }

  loadGraph(skip: number, filter?: TableFiltering) {
    if (!this.tableInput.isLoadGraph) {
      return;
    }
    const cb = (x) => this._cyService.loadElementsFromDatabase(x, this.tableInput.isMergeGraph);
    const isIgnoreCase = this._g.userPrefs.isIgnoreCaseInText.getValue();
    const txtCondition = getQueryCondition4TxtFilter(filter, ['n.primary_name', 'degree'], isIgnoreCase);
    const ui2Db = { 'Actor': 'n.primary_name', 'Count': 'degree' };
    const orderExpr = getOrderByExpression4Query(filter, 'degree', 'desc', ui2Db);
    const dateFilter = this.getDateRangeCQL();

    const cql = `MATCH (n:Person)-[r:ACTOR|ACTRESS]->(:Title)
      WHERE ${dateFilter}  
      WITH n, SIZE(COLLECT(r)) as degree, COLLECT(r) as edges
      WHERE degree >= ${this.movieCnt} ${txtCondition}
      RETURN DISTINCT n, edges, degree 
      ORDER BY ${orderExpr} SKIP ${skip} LIMIT ${this.tableInput.pageSize}`;
    this._dbService.runQuery(cql, cb);
  }

  fillTable(data) {
    const rawData = data.data[0];
    this.tableInput.results = [];
    for (let i = 0; i < rawData[0].length; i++) {
      this.tableInput.results.push([{ type: TableDataType.number, val: rawData[1][i] }, { type: TableDataType.string, val: rawData[0][i] },
      { type: TableDataType.number, val: rawData[2][i] }]);
    }
    this.tableInput.resultCnt = rawData[3];
    this.tableFilled.next(true);
  }

  getDataForQueryResult(e: TableRowMeta) {
    let d1 = this._g.userPrefs.dbQueryTimeRange.start.getValue();
    let d2 = this._g.userPrefs.dbQueryTimeRange.end.getValue();
    let s = `Get actors by title counts with: "${new Date(d1).toLocaleString()}", "${new Date(d2).toLocaleString()}", "${this.movieCnt}"`;
    if (e.tableIdx) {
      s += ', ' + e.tableIdx.join(',');
    }
    let cb = (x) => { this._cyService.loadElementsFromDatabase(x, this.tableInput.isMergeGraph); this._g.add2GraphHistory(s); };

    let idFilter = buildIdFilter(e.dbIds, true);
    const isIgnoreCase = this._g.userPrefs.isIgnoreCaseInText.getValue();
    let txtCondition = getQueryCondition4TxtFilter(null, ['n.primary_name', 'degree'], isIgnoreCase);
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
    const skip = filter.skip ? filter.skip : 0;
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
    return `r.act_begin >= ${d1} AND r.act_end <= ${d2}`;
  }
}