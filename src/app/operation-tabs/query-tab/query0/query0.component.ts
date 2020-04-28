import { Component, OnInit } from '@angular/core';
import { DbAdapterService } from '../../../db-service/db-adapter.service';
import { CytoscapeService } from '../../../cytoscape.service';
import { GlobalVariableService } from '../../../global-variable.service';
import flatpickr from 'flatpickr';
import { TableViewInput, TableDataType, TableFiltering, TableRowMeta } from 'src/app/table-view/table-view-types';
import { Subject } from 'rxjs';


@Component({
  selector: 'app-query0',
  templateUrl: './query0.component.html',
  styleUrls: ['./query0.component.css']
})
export class Query0Component implements OnInit {
  movieCnt: number;
  tableFilled = new Subject<boolean>();

  tableInput: TableViewInput = { columns: ['Actor', 'Count'], results: [], resultCnt: 0, currPage: 1, pageSize: 0, isLoadGraph: true, isMergeGraph: true, isNodeData: true };

  constructor(private _dbService: DbAdapterService, private _cyService: CytoscapeService, private _g: GlobalVariableService) {
  }

  ngOnInit() {
    this.movieCnt = 30;
    let opt = {
      defaultDate: new Date(1960, 0, 1, 0, 0, 0), enableTime: true, enableSeconds: true, time_24hr: true,
    };
    let opt2 = {
      defaultDate: new Date(2020, 11, 31, 0, 0, 0), enableTime: true, enableSeconds: true, time_24hr: true,
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
    this._dbService.getCount4Q0(d1, d2, this.movieCnt, (x) => { this.tableInput.resultCnt = x.data[0] }, filter);
  }

  loadTable(d1: number, d2: number, skip: number, filter?: TableFiltering) {
    this._dbService.getTable4Q0(d1, d2, this.movieCnt, skip, this.tableInput.pageSize, (x) => this.fillTable(x), filter);
  }

  loadGraph(d1: number, d2: number, skip: number, filter?: TableFiltering) {
    if (!this.tableInput.isLoadGraph) {
      return;
    }
    let cb = (x) => this._cyService.loadElementsFromDatabase(x, this.tableInput.isMergeGraph);
    this._dbService.getGraph4Q0(d1, d2, this.movieCnt, skip, this.tableInput.pageSize, cb, undefined, undefined, filter);
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
    this._dbService.getGraph4Q0(d1, d2, this.movieCnt, 0, this.tableInput.pageSize,
      x => this._cyService.loadElementsFromDatabase(x, this.tableInput.isMergeGraph), e.dbIds, e.tableIdx);
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