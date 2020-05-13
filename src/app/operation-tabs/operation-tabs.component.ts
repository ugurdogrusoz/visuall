import { Component } from '@angular/core';
import { GlobalVariableService } from '../global-variable.service';
import { ObjectTabComponent } from './object-tab/object-tab.component';
import { MapTabComponent } from './map-tab/map-tab.component';
import { QueryTabComponent } from './query-tab/query-tab.component';
import { SettingsTabComponent } from './settings-tab/settings-tab.component';
import { TabCustomizationModule } from './tab-customization/tab-customization.module';
import { SparqlQueryComponent } from './sparql-query/sparql-query.component';
import { SparqlDbService } from '../db-service/sparql-db.service';
import { RecommendComponent } from './recommend/recommend.component';

@Component({
  selector: 'app-operation-tabs',
  templateUrl: './operation-tabs.component.html',
  styleUrls: ['./operation-tabs.component.css']
})

export class OperationTabsComponent {
  currTab: Number;
  tabs: { component: any, text: string }[] = [{ component: ObjectTabComponent, text: 'Object' }, { component: MapTabComponent, text: 'Map' }, { component: QueryTabComponent, text: 'Database' }, { component: SettingsTabComponent, text: 'Settings' }];

  constructor(private _g: GlobalVariableService) {
    this.currTab = this._g.operationTabChanged.getValue();
    this._g.operationTabChanged.subscribe(x => { this.currTab = x });
    this.tabs = this.tabs.concat(TabCustomizationModule.tabs);
  }

  setTab(i: number) {
    this._g.operationTabChanged.next(i);
  }
}