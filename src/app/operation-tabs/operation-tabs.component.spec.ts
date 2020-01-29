import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { OperationTabsComponent } from './operation-tabs.component';
import { GroupTabComponent } from './map-tab/group-tab/group-tab.component';
import { MapTabComponent } from './map-tab/map-tab.component';
import { ObjectTabComponent } from '../operation-tabs/object-tab/object-tab.component';
import { QueryTabComponent } from '../operation-tabs/query-tab/query-tab.component';
import { SettingsTabComponent } from '../operation-tabs/settings-tab/settings-tab.component';
import { Query0Component } from '../operation-tabs/query-tab/query0/query0.component';
import { Query1Component } from '../operation-tabs/query-tab/query1/query1.component';

import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-object-tab',
  template: '',
  providers: [
    {
      provide: ObjectTabComponent,
      useClass: ObjectTabComponentStub
    }
  ]
})
export class ObjectTabComponentStub {
}

describe('OperationTabsComponent', () => {
  let component: OperationTabsComponent;
  let fixture: ComponentFixture<OperationTabsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [OperationTabsComponent, MapTabComponent, GroupTabComponent, ObjectTabComponentStub, QueryTabComponent, SettingsTabComponent, Query0Component, Query1Component],
      imports: [FormsModule, HttpClientModule]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OperationTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
