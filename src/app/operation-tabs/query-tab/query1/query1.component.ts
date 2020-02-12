import { Component, OnInit, AfterViewInit } from '@angular/core';
import { DbAdapterService } from '../../../db-service/db-adapter.service';
import { CytoscapeService } from '../../../cytoscape.service';
import { GlobalVariableService } from '../../../global-variable.service';
import flatpickr from 'flatpickr';
import { TableViewInput, TableDataType } from 'src/app/table-view/table-view-types';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-query1',
  templateUrl: './query1.component.html',
  styleUrls: ['./query1.component.css']
})
export class Query1Component implements OnInit, AfterViewInit {

  selectedGenre: string;
  movieGenres: string[];
  tableInput: TableViewInput = { columns: ['Movie'], results: [], resultCnt: 0, currPage: 1, pageSize: 0, isLoadGraph: true, isMergeGraph: true, isNodeData: true };
  tableFilled = new Subject<boolean>();
  date1Id = 'query1-inp0';
  date2Id = 'query1-inp1';

  constructor(private _dbService: DbAdapterService, private _cyService: CytoscapeService, private _g: GlobalVariableService) {
    this.movieGenres = [];
  }

  ngOnInit() {

    this.selectedGenre = 'Action';
    setTimeout(() => { this._dbService.getMovieGenres((x) => this.fillGenres(x)); }, 0);
    this.tableInput.results = [];
    this._g.userPrefs.dataPageSize.subscribe(x => { this.tableInput.pageSize = x; });
  }

  ngAfterViewInit(): void {

    let opt = {
      defaultDate: new Date(1960, 9, 9, 0, 0, 0), enableTime: true, enableSeconds: true, time_24hr: true,
    };
    let opt2 = {
      defaultDate: new Date(2020, 9, 9, 0, 0, 0), enableTime: true, enableSeconds: true, time_24hr: true,
    };

    flatpickr('#' + this.date1Id, opt);
    flatpickr('#' + this.date2Id, opt2);
  }

  prepareQuery() {
    let d1 = document.querySelector('#' + this.date1Id)['_flatpickr'].selectedDates[0].getFullYear();
    let d2 = document.querySelector('#' + this.date2Id)['_flatpickr'].selectedDates[0].getFullYear();
    let skip = (this.tableInput.currPage - 1) * this.tableInput.pageSize;

    this.getCountOfData(d1, d2);
    this.loadTable(d1, d2, skip);
    this.loadGraph(d1, d2, skip);
  }

  getCountOfData(d1: number, d2: number) {
    this._dbService.getCount4Q1(d1, d2, this.selectedGenre, (x) => { this.tableInput.resultCnt = x.data[0]; });
  }

  loadTable(d1: number, d2: number, skip: number) {
    this._dbService.getTable4Q1(d1, d2, this.selectedGenre, skip, this.tableInput.pageSize, (x) => this.fillTable(x));
  }

  loadGraph(d1: number, d2: number, skip: number) {
    if (!this.tableInput.isLoadGraph) {
      return;
    }

    this._dbService.getGraph4Q1(d1, d2, this.selectedGenre, skip, this.tableInput.pageSize,
      (x) => this._cyService.loadElementsFromDatabase(x, this.tableInput.isMergeGraph));
  }

  pageChanged(newPage: number) {
    let d1 = document.querySelector('#' + this.date1Id)['_flatpickr'].selectedDates[0].getFullYear();
    let d2 = document.querySelector('#' + this.date2Id)['_flatpickr'].selectedDates[0].getFullYear();
    let skip = (newPage - 1) * this.tableInput.pageSize;

    this.loadTable(d1, d2, skip);
    this.loadGraph(d1, d2, skip);
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

  getDataForQueryResult(id: number) {
    let d1 = document.querySelector('#' + this.date1Id)['_flatpickr'].selectedDates[0].getFullYear();
    let d2 = document.querySelector('#' + this.date2Id)['_flatpickr'].selectedDates[0].getFullYear();

    this._dbService.getDataForQ1(id, d1, d2, this.selectedGenre, (x) => this._cyService.loadElementsFromDatabase(x, this.tableInput.isMergeGraph));
  }
}