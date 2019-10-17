import { Component, OnInit, AfterViewInit } from '@angular/core';
import { DATA_PAGE_SIZE, EV_MOUSE_ON, EV_MOUSE_OFF } from '../../../constants';
import { DbService } from '../../../db.service';
import { CytoscapeService } from '../../../cytoscape.service';
import { GlobalVariableService } from '../../../global-variable.service';
import flatpickr from 'flatpickr';

@Component({
  selector: 'app-query1',
  templateUrl: './query1.component.html',
  styleUrls: ['./query1.component.css']
})
export class Query1Component implements OnInit, AfterViewInit {

  selectedGenre: string;
  results: any[];
  movieGenres: string[];
  currPage: number;
  pageSize: number;
  isLoadGraph: boolean;
  isMergeGraph: boolean;
  txtCol1 = 'Movie';
  txtCol2 = false;
  resultCnt = 0;
  date1Id = 'query1-inp0';
  date2Id = 'query1-inp1';

  constructor(private _dbService: DbService, private _cyService: CytoscapeService, private _g: GlobalVariableService) {
    this.currPage = 1;
    this.isLoadGraph = true;
    this.isMergeGraph = true;
    this.movieGenres = [];
    this.pageSize = DATA_PAGE_SIZE;
  }

  ngOnInit() {

    this.selectedGenre = 'Action';
    let genres = `MATCH (m:Movie{})return distinct m.genre  `;
    this._dbService.runQuery(genres, null, (x) => this.fillGenres(x), false);
    this.results = [];
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
    let skip = (this.currPage - 1) * DATA_PAGE_SIZE;
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
    this._dbService.runQuery(cql, null, (x) => { this.resultCnt = x.data[0]; }, false);
  }

  loadTable(d1: string, d2: string, skip: number) {
    let cql = ` MATCH (m:Movie {genre:'${this.selectedGenre}'})
    WHERE m.released > ${d1} AND m.released < ${d2}  
    RETURN DISTINCT ID(m) as id, m.title
    ORDER BY m.title DESC SKIP ${skip} LIMIT ${DATA_PAGE_SIZE}`;
    this._dbService.runQuery(cql, null, (x) => this.fillTable(x), false);
  }

  loadGraph(d1: string, d2: string, skip: number) {
    if (!this.isLoadGraph) {
      return;
    }
    let cql = `MATCH (m:Movie {genre:'${this.selectedGenre}'})<-[r:ACTED_IN]-(a:Person)
    WHERE m.released > ${d1} AND m.released < ${d2}  
    WITH m, COLLECT(r) as edges
    RETURN  m, edges
    ORDER BY m.title DESC SKIP ${skip} LIMIT ${DATA_PAGE_SIZE}`;

    this._dbService.runQuery(cql, null, (x) => this._cyService.loadElementsFromDatabase(x, this.isMergeGraph), true);
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
    this.results = [];
    for (let i = 0; i < data.data.length; i++) {
      this.results.push({ id: data.data[i][0], name: data.data[i][1] });
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

    this._dbService.runQuery(cql, null, (x) => this._cyService.loadElementsFromDatabase(x, this.isMergeGraph), true);
  }
}