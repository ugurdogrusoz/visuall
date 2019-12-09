import { Component, OnInit, AfterViewInit } from '@angular/core';
import { DATA_PAGE_SIZE } from '../../../constants';
import { DbService } from '../../../db.service';
import { CytoscapeService } from '../../../cytoscape.service';
import { GlobalVariableService } from '../../../global-variable.service';
import flatpickr from 'flatpickr';
import { iTableViewInput, TableDataType } from 'src/app/table-view/table-view-types';

@Component({
  selector: 'app-query1',
  templateUrl: './query1.component.html',
  styleUrls: ['./query1.component.css']
})
export class Query1Component implements OnInit, AfterViewInit {

  selectedGenre: string;
  movieGenres: string[];
  tableInput: iTableViewInput = { columns: ['Movie'], results: [], resultCnt: 0, currPage: 1, pageSize: DATA_PAGE_SIZE, isLoadGraph: true, isMergeGraph: true, isNodeData: true };

  date1Id = 'query1-inp0';
  date2Id = 'query1-inp1';

  constructor(private _dbService: DbService, private _cyService: CytoscapeService, private _g: GlobalVariableService) {
    this.movieGenres = [];
  }

  ngOnInit() {

    this.selectedGenre = 'Action';
    let genres = `MATCH (m:Movie{})return distinct m.genre  `;
    setTimeout(() => { this._dbService.runQuery(genres, null, (x) => this.fillGenres(x), false); }, 0);
    this.tableInput.results = [];
  }

  ngAfterViewInit(): void {

    let opt = {
      defaultDate: new Date(1960, 9, 9, 0, 0, 0),
    };
    let opt2 = {
      defaultDate: new Date(2020, 9, 9, 0, 0, 0),
    };

    flatpickr('#' + this.date1Id, opt);
    flatpickr('#' + this.date2Id, opt2);
  }

  prepareQuery() {
    let date1 = document.querySelector('#' + this.date1Id)['_flatpickr'].selectedDates[0];
    let date2 = document.querySelector('#' + this.date2Id)['_flatpickr'].selectedDates[0];
    let skip = (this.tableInput.currPage - 1) * DATA_PAGE_SIZE;
    let d1 = flatpickr.formatDate(date1, 'Y-M-D').substring(0, 4);
    let d2 = flatpickr.formatDate(date2, 'Y-M-D').substring(0, 4);

    this.getCountOfData(d1, d2);
    this.loadTable(d1, d2, skip);
    this.loadGraph(d1, d2, skip);
  }

  getCountOfData(d1: string, d2: string) {
    let cql = ` MATCH (m:Movie {genre:'${this.selectedGenre}'})
    WHERE m.released> ${d1} AND m.released < ${d2}  
    RETURN DISTINCT COUNT(*)`;
    this._dbService.runQuery(cql, null, (x) => { this.tableInput.resultCnt = x.data[0]; }, false);
  }

  loadTable(d1: string, d2: string, skip: number) {
    let cql = ` MATCH (m:Movie {genre:'${this.selectedGenre}'})
    WHERE m.released > ${d1} AND m.released < ${d2}  
    RETURN DISTINCT ID(m) as id, m.title
    ORDER BY m.title DESC SKIP ${skip} LIMIT ${DATA_PAGE_SIZE}`;
    this._dbService.runQuery(cql, null, (x) => this.fillTable(x), false);
  }

  loadGraph(d1: string, d2: string, skip: number) {
    if (!this.tableInput.isLoadGraph) {
      return;
    }
    let cql = `MATCH (m:Movie {genre:'${this.selectedGenre}'})<-[r:ACTED_IN]-(a:Person)
    WHERE m.released > ${d1} AND m.released < ${d2}  
    WITH m, COLLECT(r) as edges
    RETURN  m, edges
    ORDER BY m.title DESC SKIP ${skip} LIMIT ${DATA_PAGE_SIZE}`;

    this._dbService.runQuery(cql, null, (x) => this._cyService.loadElementsFromDatabase(x, this.tableInput.isMergeGraph), true);
  }

  pageChanged(newPage: number) {
    let date1 = document.querySelector('#' + this.date1Id)['_flatpickr'].selectedDates[0];
    let date2 = document.querySelector('#' + this.date2Id)['_flatpickr'].selectedDates[0];
    let skip = (newPage - 1) * DATA_PAGE_SIZE;
    let d1 = flatpickr.formatDate(date1, 'Y-M-D').substring(0, 4);
    let d2 = flatpickr.formatDate(date2, 'Y-M-D').substring(0, 4);

    this.loadTable(d1, d2, skip);
    this.loadGraph(d1, d2, skip);
  }

  fillTable(data) {
    this.tableInput.results = [];
    for (let i = 0; i < data.data.length; i++) {
      const d = data.data[i];
      this.tableInput.results.push([{ type: TableDataType.number, val: d[0] }, { type: TableDataType.string, val: d[1] }]);
    }
  }

  fillGenres(data) {
    this.movieGenres = [];
    for (let i = 0; i < data.data.length; i++) {
      this.movieGenres.push(data.data[i]);
    }
  }

  getDataForQueryResult(id: number) {

    let date1 = document.querySelector('#' + this.date1Id)['_flatpickr'].selectedDates[0];
    let date2 = document.querySelector('#' + this.date2Id)['_flatpickr'].selectedDates[0];
    let d1 = flatpickr.formatDate(date1, 'Y-M-D').substring(0, 4);;
    let d2 = flatpickr.formatDate(date2, 'Y-M-D').substring(0, 4);

    let cql =
      `MATCH p=(m:Movie{genre:'${this.selectedGenre}'})<-[:ACTED_IN]-(a:Person) WHERE ID(m) = ${id} 
     AND m.released > ${d1} AND m.released < ${d2}
     RETURN nodes(p), relationships(p)`;

    this._dbService.runQuery(cql, null, (x) => this._cyService.loadElementsFromDatabase(x, this.tableInput.isMergeGraph), true);
  }
}