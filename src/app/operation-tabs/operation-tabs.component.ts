import { Component, OnInit, ViewChild } from '@angular/core';
import { GroupTabComponent } from './map-tab/group-tab/group-tab.component';

@Component({
  selector: 'app-operation-tabs',
  templateUrl: './operation-tabs.component.html',
  styleUrls: ['./operation-tabs.component.css']
})

export class OperationTabsComponent implements OnInit {
  currTab: Number;
  navItems: any[];

  constructor() {
    this.currTab = 1;
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