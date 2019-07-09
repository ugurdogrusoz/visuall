import { Component, OnInit } from '@angular/core';
import { DATA_PAGE_SIZE, EV_MOUSE_ON, EV_MOUSE_OFF } from '../../../constants';
import { DbService } from '../../../db.service';
import { CytoscapeService } from '../../../cytoscape.service';
import { GlobalVariableService } from '../../../global-variable.service';
import flatpickr from 'flatpickr';
import { $ } from 'protractor';
import { timingSafeEqual } from 'crypto';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-query1',
  templateUrl: './query1.component.html',
  styleUrls: ['./query1.component.css']
})
export class Query1Component implements OnInit {

  selectedGenre: string;
  results: any[];
  movieGenres: string[];
  currPage: number;
  pageSize: number;
  isLoadGraph: boolean;
  isMergeGraph: boolean;
  highlighterFn: any;


  constructor(private _dbService: DbService, private _cyService: CytoscapeService, private _g: GlobalVariableService) {
    this.currPage = 0;
    this.isLoadGraph = true;
    this.isMergeGraph = true;
    this.highlighterFn = this._cyService.highlightNeighbors();
    this.movieGenres = [];
  }

  ngOnInit() {

    this.selectedGenre = "Action";
    let opt = {
      defaultDate: new Date(1960, 9, 9, 0, 0, 0),
    };
    let opt2 = {
      defaultDate: new Date(2000, 9, 9, 0, 0, 0),
    };
    let genres = `MATCH (m:Movie{})return distinct m.genre  `;

    this._dbService.runQuery(genres, null, (x) => this.fillGenres(x), false);

    flatpickr('#query1-inp0', opt);
    flatpickr('#query1-inp1', opt2);

    this.results = [];

  }

  prepareQuery() {
    let date1 = document.querySelector('#query1-inp0')['_flatpickr'].selectedDates[0];
    let date2 = document.querySelector('#query1-inp1')['_flatpickr'].selectedDates[0];
    let skip = this.currPage * DATA_PAGE_SIZE;
    let d1=flatpickr.formatDate(date1,"Y-M-D").substring(0,4);;
    let d2=flatpickr.formatDate(date2,"Y-M-D").substring(0,4);
  
    //console.log(document.querySelector('#query0-inp1')['_flatpickr'].selectedDates[0]);
    let cql =
      ` MATCH (m:Movie {genre:'${this.selectedGenre}'})<-[:ACTED_IN]-(a:Person)
    WHERE m.released> ${d1} AND m.released < ${d2}  
    RETURN DISTINCT ID(m) as id, m.title
    ORDER BY m.title DESC SKIP ${skip} LIMIT ${DATA_PAGE_SIZE}`;

    this._dbService.runQuery(cql, null, (x) => this.fillTable(x), false);

    if (this.isLoadGraph) {
      cql =
        ` MATCH (m:Movie {genre:'${this.selectedGenre}'})<-[r:ACTED_IN]-(a:Person)
      WHERE m.released > ${d1} AND m.released< ${d2}  
      WITH m, COLLECT(r) as edges
      RETURN  m, edges
      SKIP ${skip} LIMIT ${DATA_PAGE_SIZE}`;

      this._dbService.runQuery(cql, null, (x) => this._cyService.loadElementsFromDatabase(x, this.isMergeGraph), true);
    }
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
    
    let date1 = document.querySelector('#query1-inp0')['_flatpickr'].selectedDates[0];
    let date2 = document.querySelector('#query1-inp1')['_flatpickr'].selectedDates[0];
    let d1=flatpickr.formatDate(date1,"Y-M-D").substring(0,4);;
    let d2=flatpickr.formatDate(date2,"Y-M-D").substring(0,4);

    let cql =
      `MATCH p=(m:Movie{genre:'${this.selectedGenre}'})<-[:ACTED_IN]-(a:Person) WHERE ID(m) = ${id} 
     AND m.released > ${d1} AND m.released < ${d2}
     RETURN nodes(p), relationships(p)`;

    this._dbService.runQuery(cql, null, (x) => this._cyService.loadElementsFromDatabase(x, this.isMergeGraph), true);
  }

  onMouseEnter(id: number) {
    this.highlighterFn({ target: this._g.cy.$('#n' + id), type: EV_MOUSE_ON });
  }

  onMouseExit(id: number) {
    this.highlighterFn({ target: this._g.cy.$('#n' + id), type: EV_MOUSE_OFF });
  }

}