import { Component, OnInit, ViewChild } from '@angular/core';
import { GroupTabComponent } from './group-tab/group-tab.component';

@Component({
  selector: 'app-operation-tabs',
  templateUrl: './operation-tabs.component.html',
  styleUrls: ['./operation-tabs.component.css']
})

export class OperationTabsComponent implements OnInit {
  currTab: Number;
  navItems: any[];
  @ViewChild(GroupTabComponent, {static: false})
  private groupComponent: GroupTabComponent;

  constructor() {
    this.currTab = 2;
  }

  ngOnInit() {
    this.navItems = [{ href: '#object', text: 'Object' }, { href: '#group', text: 'Group' }, { href: '#filter', text: 'Filter' },
    { href: '#query', text: 'Query' }, { href: '#settings', text: 'Settings' }];
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

  setTab(i:number) {
    this.currTab = i;
    if (i == 1) {
      this.groupComponent.componentOpened();
    }
  }
}



