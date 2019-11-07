import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppComponent } from './app.component';
import { NavbarComponent } from './navbar/navbar.component';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { TimebarComponent } from './timebar/timebar.component';
import { OperationTabsComponent } from './operation-tabs/operation-tabs.component';
import { HttpClientModule } from '@angular/common/http';
import { CytoscapeComponent } from './cytoscape/cytoscape.component';
import { SaveAsPngModalComponent } from './popups/save-as-png-modal/save-as-png-modal.component';
import { QuickHelpModalComponent } from './popups/quick-help-modal/quick-help-modal.component';
import { AboutModalComponent } from './popups/about-modal/about-modal.component';
import { ObjectTabComponent } from './operation-tabs/object-tab/object-tab.component';
import { FilterTabComponent } from './operation-tabs/filter-tab/filter-tab.component';
import { SettingsTabComponent } from './operation-tabs/settings-tab/settings-tab.component';
import { QueryTabComponent } from './operation-tabs/query-tab/query-tab.component';
import { Query0Component } from './operation-tabs/query-tab/query0/query0.component';
import { GroupTabComponent } from './operation-tabs/group-tab/group-tab.component';
import { Query1Component } from './operation-tabs/query-tab/query1/query1.component';
import { TableViewComponent } from './table-view/table-view.component';
import { TimebarMetricEditorComponent } from './operation-tabs/settings-tab/timebar-metric-editor/timebar-metric-editor.component';


@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    ToolbarComponent,
    TimebarComponent,
    OperationTabsComponent,
    CytoscapeComponent,
    SaveAsPngModalComponent,
    QuickHelpModalComponent,
    AboutModalComponent,
    ObjectTabComponent,
    FilterTabComponent,
    SettingsTabComponent,
    QueryTabComponent,
    Query0Component,
    GroupTabComponent,
    Query1Component,
    TableViewComponent,
    TimebarMetricEditorComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    NgbModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: [SaveAsPngModalComponent, QuickHelpModalComponent, AboutModalComponent]
})
export class AppModule { }
