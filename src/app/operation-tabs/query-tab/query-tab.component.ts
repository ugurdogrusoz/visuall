import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-query-tab',
  templateUrl: './query-tab.component.html',
  styleUrls: ['./query-tab.component.css']
})
export class QueryTabComponent implements OnInit {
  queryTypes: string[];
  selectedQuery: string;
  selectedIdx: number;
  advancedQueries: string[];
  selectedAdvancedQuery: string;
  selectedIdx2: number;

  constructor() {
    this.queryTypes = ['Get actors by title counts', 'Get titles by genre'];
    this.advancedQueries = ['Get graph of interest', 'Get common targets/regulators'];
    this.selectedIdx = -1;
    this.selectedIdx2 = -1;
  }

  ngOnInit() {
    this.selectedQuery = '';
    this.selectedAdvancedQuery = '';
  }

  changeQuery(event) {
    this.selectedIdx = this.queryTypes.findIndex(x => x == event.target.value);
  }

  changeAdvancedQuery(event) {
    this.selectedIdx2 = this.advancedQueries.findIndex(x => x == event.target.value);
  }
}
