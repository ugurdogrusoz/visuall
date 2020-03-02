import { Component, OnInit } from '@angular/core';
import { GlobalVariableService } from '../global-variable.service';

@Component({
  selector: 'app-operation-tabs',
  templateUrl: './operation-tabs.component.html',
  styleUrls: ['./operation-tabs.component.css']
})

export class OperationTabsComponent implements OnInit {
  currTab: Number;
  navItems: any[];

  constructor(private _g: GlobalVariableService) {
    this.currTab = this._g.operationTabChanged.getValue();
    this._g.operationTabChanged.subscribe(x => { this.setTab(x) });
  }

  ngOnInit() {
    this.navItems = [{ href: '#object', text: 'Object' }, { href: '#map', text: 'Map' },
    { href: '#query', text: 'Database' }, { href: '#settings', text: 'Settings' }];
  }

  setTabClasses(tabId: number) {
    if (tabId === this.currTab) {
      return 'active show';
    }
    return '';
  }

  tabChanged(event: number) {
    this.currTab = event;
  }

  setTab(i: number) {
    this.currTab = i;
  }
}