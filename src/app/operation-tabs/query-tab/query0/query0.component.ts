import { Component, OnInit } from '@angular/core';
import { DATA_PAGE_SIZE, EV_MOUSE_ON, EV_MOUSE_OFF } from '../../../constants';
import { DbService } from '../../../db.service';
import { CytoscapeService } from '../../../cytoscape.service';
import { GlobalVariableService } from '../../../global-variable.service';
import flatpickr from 'flatpickr';


@Component({
  selector: 'app-query0',
  templateUrl: './query0.component.html',
  styleUrls: ['./query0.component.css']
})
export class Query0Component implements OnInit {
  movieCnt: number;
  results: any[];
  currPage: number;
  pageSize: number;
  isLoadGraph: boolean;
  isMergeGraph: boolean;
  resultCnt: number;
  txtCol1 = 'Actor';
  txtCol2 = 'Count';

  constructor(private _dbService: DbService, private _cyService: CytoscapeService, private _g: GlobalVariableService) {
    this.currPage = 1;
    this.isLoadGraph = true;
    this.isMergeGraph = true;
    this.resultCnt = 0;
    this.pageSize = DATA_PAGE_SIZE;
  }

  ngOnInit() {
    this.movieCnt = 3;
    let opt = {
      defaultDate: new Date(1960, 9, 9, 0, 0, 0),
    };
    let opt2 = {
      defaultDate: new Date(2020, 9, 9, 0, 0, 0),
    };

    flatpickr('#query0-inp1', opt);
    flatpickr('#query0-inp2', opt2);
    this.results = [];
  }

  prepareQuery() {

    let d1 = document.querySelector('#query0-inp1')['_flatpickr'].selectedDates[0].getTime();
    let d2 = document.querySelector('#query0-inp2')['_flatpickr'].selectedDates[0].getTime();
    let skip = (this.currPage - 1) * DATA_PAGE_SIZE;

    this.getCountOfData(d1, d2);
    this.loadTable(d1, d2, skip);
    this.loadGraph(d1, d2, skip);
  }

  getCountOfData(d1: number, d2: number) {
    let cql = `MATCH (n:Person)-[r:ACTED_IN]->(:Movie)
    WHERE r.act_begin >= ${d1} AND r.act_end <= ${d2}  
    WITH n, SIZE(COLLECT(r)) as degree
    WHERE degree >= ${this.movieCnt}
    RETURN DISTINCT COUNT(*)`;
    this._dbService.runQuery(cql, null, (x) => { this.resultCnt = x.data[0]; }, false);
  }

  pageChanged(newPage: number) {
    let d1 = document.querySelector('#query0-inp1')['_flatpickr'].selectedDates[0].getTime();
    let d2 = document.querySelector('#query0-inp2')['_flatpickr'].selectedDates[0].getTime();
    let skip = (newPage - 1) * DATA_PAGE_SIZE;

    this.loadTable(d1, d2, skip);
    this.loadGraph(d1, d2, skip);
  }

  loadTable(d1: number, d2: number, skip: number) {
    let cql = `MATCH (n:Person)-[r:ACTED_IN]->(:Movie)
    WHERE r.act_begin >= ${d1} AND r.act_end <= ${d2}  
    WITH n, SIZE(COLLECT(r)) as degree
    WHERE degree >= ${this.movieCnt}
    RETURN DISTINCT ID(n) as id, n.name as Actor, degree as Count 
    ORDER BY degree DESC SKIP ${skip} LIMIT ${DATA_PAGE_SIZE}`;
    this._dbService.runQuery(cql, null, (x) => this.fillTable(x), false);
  }

  loadGraph(d1: number, d2: number, skip: number) {
    if (!this.isLoadGraph) {
      return;
    }
    let cql = `MATCH (n:Person)-[r:ACTED_IN]->(:Movie)
      WHERE r.act_begin >= ${d1} AND r.act_end <= ${d2}  
      WITH n, SIZE(COLLECT(r)) as degree, COLLECT(r) as edges
      WHERE degree >= ${this.movieCnt}
      RETURN n, edges ORDER BY degree DESC SKIP ${skip} LIMIT ${DATA_PAGE_SIZE}`;
    this._dbService.runQuery(cql, null, (x) => this._cyService.loadElementsFromDatabase(x, this.isMergeGraph), true);
  }

  fillTable(data) {
    this.results = [];
    for (let i = 0; i < data.data.length; i++) {
      this.results.push({ id: data.data[i][0], name: data.data[i][1], count: data.data[i][2] });
    }
  }

  getDataForQueryResult(id: number) {
    let d1 = document.querySelector('#query0-inp1')['_flatpickr'].selectedDates[0].getTime();
    let d2 = document.querySelector('#query0-inp2')['_flatpickr'].selectedDates[0].getTime();

    let cql =
      `MATCH p=(n:Person)-[r:ACTED_IN]->(:Movie) WHERE ID(n) = ${id} AND r.act_begin >= ${d1} AND r.act_end <= ${d2}
    RETURN nodes(p), relationships(p)`;

    this._dbService.runQuery(cql, null, (x) => this._cyService.loadElementsFromDatabase(x, this.isMergeGraph), true);

  }
}