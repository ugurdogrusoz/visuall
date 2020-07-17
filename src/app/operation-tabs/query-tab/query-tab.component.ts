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

  constructor() {
    this.queryTypes = ['Get actors by title counts', 'Get titles by genre'];
    this.selectedIdx = -1;
  }

  ngOnInit() {
    this.selectedQuery = '';
  }

  changeQuery(event) {
    this.selectedIdx = this.queryTypes.findIndex(x => x == event.target.value);
  }
}
