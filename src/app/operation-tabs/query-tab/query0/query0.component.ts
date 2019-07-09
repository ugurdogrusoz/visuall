import { Component, OnInit } from '@angular/core';
import { DATA_PAGE_SIZE, EV_MOUSE_ON, EV_MOUSE_OFF } from '../../../constants';
import { DbService } from '../../../db.service';
import { CytoscapeService } from '../../../cytoscape.service';
import { GlobalVariableService } from '../../../global-variable.service';
import flatpickr from 'flatpickr';
import { $ } from 'protractor';
import { timingSafeEqual } from 'crypto';


@Component({
  selector: 'app-query0',
  templateUrl: './query0.component.html',
  styleUrls: ['./query0.component.css']
})
export class Query0Component implements OnInit {
  movieCnt: number;
  results: any[];
  totalCount: number;
  currPage: number;
  pageSize: number;
  isLoadGraph: boolean;
  isMergeGraph: boolean;
  highlighterFn: any;

  constructor(private _dbService: DbService, private _cyService: CytoscapeService, private _g: GlobalVariableService) {
    this.totalCount = this.currPage = 0;
    this.isLoadGraph = true;
    this.isMergeGraph = true;
    this.highlighterFn = this._cyService.highlightNeighbors();
  }

  ngOnInit() {
    this.movieCnt = 3;
    let opt = {
      defaultDate: new Date(1960, 9, 9, 0, 0, 0),
    };
    let opt2 = {
      defaultDate: new Date(2000, 9, 9, 0, 0, 0),
    };

    flatpickr('#query0-inp1', opt);
    flatpickr('#query0-inp2', opt2);
    this.results = [];
  }

  prepareQuery() {

    let d1 = document.querySelector('#query0-inp1')['_flatpickr'].selectedDates[0].getTime();
    let d2 = document.querySelector('#query0-inp2')['_flatpickr'].selectedDates[0].getTime();
    let skip = this.currPage * DATA_PAGE_SIZE;
   
    let cql =
      `MATCH (n:Person)-[r:ACTED_IN]->(:Movie)
    WHERE r.begin_datetime > ${d1} AND r.end_datetime < ${d2}  
    WITH n, SIZE(COLLECT(r)) as degree
    WHERE degree > ${this.movieCnt}
    RETURN DISTINCT ID(n) as id, n.name as Actor, degree as Count 
    ORDER BY degree DESC SKIP ${skip} LIMIT ${DATA_PAGE_SIZE}`;

    this._dbService.runQuery(cql, null, (x) => this.fillTable(x), false);

    if (this.isLoadGraph) {
      cql =
        `MATCH (n:Person)-[r:ACTED_IN]->(:Movie)
    WHERE r.begin_datetime > ${d1} AND r.end_datetime < ${d2}  
    WITH n, SIZE(COLLECT(r)) as degree, COLLECT(r) as edges
    WHERE degree > ${this.movieCnt}
    return n, edges
    SKIP ${skip} LIMIT ${DATA_PAGE_SIZE}`;
      this._dbService.runQuery(cql, null, (x) => this._cyService.loadElementsFromDatabase(x, this.isMergeGraph), true);
    }
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
      `MATCH p=(n:Person)-[r:ACTED_IN]->(:Movie) WHERE ID(n) = ${id} AND r.begin_datetime > ${d1} AND r.end_datetime < ${d2}
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