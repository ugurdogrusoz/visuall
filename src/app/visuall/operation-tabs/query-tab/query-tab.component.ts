import { Component, OnInit } from '@angular/core';
import { CustomizationModule } from '../../../custom/customization.module';

@Component({
  selector: 'app-query-tab',
  templateUrl: './query-tab.component.html',
  styleUrls: ['./query-tab.component.css']
})
export class QueryTabComponent implements OnInit {
  queries: { component: any, text: string }[];
  selectedQuery: string;
  selectedIdx: number;
  customSubTabs: { component: any, text: string }[] = CustomizationModule.databaseSubTabs;

  constructor() {
    this.queries = CustomizationModule.queries;
    this.selectedIdx = -1;
  }

  ngOnInit() {
    this.selectedQuery = '';
  }

  changeQuery(event) {
    this.selectedIdx = this.queries.findIndex(x => x.text == event.target.value);
  }
}
