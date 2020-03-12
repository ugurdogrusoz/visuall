import { Component } from '@angular/core';
import { GlobalVariableService } from '../global-variable.service';
import { ObjectTabComponent } from './object-tab/object-tab.component';
import { MapTabComponent } from './map-tab/map-tab.component';
import { QueryTabComponent } from './query-tab/query-tab.component';
import { SettingsTabComponent } from './settings-tab/settings-tab.component';
import { TabCustomizationService } from './tab-customization.service';

@Component({
  selector: 'app-operation-tabs',
  templateUrl: './operation-tabs.component.html',
  styleUrls: ['./operation-tabs.component.css']
})

export class OperationTabsComponent {
  currTab: Number;
  tabs: { component: any, text: string }[] = [{ component: ObjectTabComponent, text: 'Object' }, { component: MapTabComponent, text: 'Map' }, { component: QueryTabComponent, text: 'Database' }, { component: SettingsTabComponent, text: 'Settings' }];

  constructor(private _g: GlobalVariableService, private _customizationService: TabCustomizationService) {
    this.currTab = this._g.operationTabChanged.getValue();
    this._g.operationTabChanged.subscribe(x => { this.currTab = x });
    this.tabs = this.tabs.concat(this._customizationService.tabs);
  }

  setTab(i: number) {
    this._g.operationTabChanged.next(i);
  }
}