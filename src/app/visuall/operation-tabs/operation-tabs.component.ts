import { Component, OnDestroy } from '@angular/core';
import { GlobalVariableService } from '../global-variable.service';
import { ObjectTabComponent } from './object-tab/object-tab.component';
import { MapTabComponent } from './map-tab/map-tab.component';
import { QueryTabComponent } from './query-tab/query-tab.component';
import { SettingsTabComponent } from './settings-tab/settings-tab.component';
import { CustomizationModule } from '../../custom/customization.module';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-operation-tabs',
  templateUrl: './operation-tabs.component.html',
  styleUrls: ['./operation-tabs.component.css']
})

export class OperationTabsComponent implements OnDestroy {
  currTab: Number;
  tabs: { component: any, text: string }[] = [{ component: ObjectTabComponent, text: 'Object' }, { component: MapTabComponent, text: 'Map' }, { component: QueryTabComponent, text: 'Database' }, { component: SettingsTabComponent, text: 'Settings' }];
  tabChangeSubs: Subscription;

  constructor(private _g: GlobalVariableService) {
    this.currTab = this._g.operationTabChanged.getValue();
    this.tabChangeSubs = this._g.operationTabChanged.subscribe(x => { this.currTab = x });
    this.tabs = this.tabs.concat(CustomizationModule.operationTabs);
  }

  setTab(i: number) {
    this._g.operationTabChanged.next(i);
  }

  ngOnDestroy(): void {
    if (this.tabChangeSubs) {
      this.tabChangeSubs.unsubscribe();
    }
  }
}