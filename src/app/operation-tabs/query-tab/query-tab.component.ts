import { Component, OnInit } from '@angular/core';
import { element } from 'protractor';

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
    this.queryTypes = ['Get actors by movie counts', 'Get movies by genre'];
    this.selectedIdx = -1;
  }

  ngOnInit() {
    this.selectedQuery = '';
  }

  changeQuery(event) {
    this.selectedIdx = this.queryTypes.findIndex(x => x == event.target.value);
  }
}
