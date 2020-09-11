import { TestBed, async } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { NavbarComponent } from './navbar/navbar.component';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { CytoscapeComponent } from './cytoscape/cytoscape.component';
import { TimebarComponent } from './timebar/timebar.component';
import { OperationTabsComponent } from './operation-tabs/operation-tabs.component';
import { MapTabComponent } from './operation-tabs/map-tab/map-tab.component';
import { GroupTabComponent } from './operation-tabs/map-tab/group-tab/group-tab.component';
import { ObjectTabComponent } from './operation-tabs/object-tab/object-tab.component';
import { QueryTabComponent } from './operation-tabs/query-tab/query-tab.component';
import { SettingsTabComponent } from './operation-tabs/settings-tab/settings-tab.component';
import { Query0Component } from './operation-tabs/query-tab/query0/query0.component';
import { Query1Component } from './operation-tabs/query-tab/query1/query1.component';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent, NavbarComponent, ToolbarComponent, CytoscapeComponent, TimebarComponent, OperationTabsComponent,
        MapTabComponent, GroupTabComponent, ObjectTabComponent, QueryTabComponent, SettingsTabComponent, Query0Component, Query1Component
      ],
      imports: [FormsModule, HttpClientModule, RouterTestingModule],
    }).compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });

  // it(`should have as title 'ng-visuall'`, () => {
  //   const fixture = TestBed.createComponent(AppComponent);
  //   const app = fixture.debugElement.componentInstance;
  //   debugger;
  //   expect(app.title).toEqual('ng-visuall');
  // });

  // it('should render title in a h1 tag', () => {
  //   const fixture = TestBed.createComponent(AppComponent);
  //   fixture.detectChanges();
  //   const compiled = fixture.debugElement.nativeElement;
  //   expect(compiled.querySelector('h1').textContent).toContain('Welcome to ng-visuall!');
  // });
});
