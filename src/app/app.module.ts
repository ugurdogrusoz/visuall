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
import { MapTabComponent } from './operation-tabs/map-tab/map-tab.component';
import { SettingsTabComponent } from './operation-tabs/settings-tab/settings-tab.component';
import { QueryTabComponent } from './operation-tabs/query-tab/query-tab.component';
import { Query0Component } from './operation-tabs/query-tab/query0/query0.component';
import { GroupTabComponent } from './operation-tabs/map-tab/group-tab/group-tab.component';
import { Query1Component } from './operation-tabs/query-tab/query1/query1.component';
import { TableViewComponent } from './table-view/table-view.component';
import { TimebarMetricEditorComponent } from './operation-tabs/settings-tab/timebar-metric-editor/timebar-metric-editor.component';
import { ColorPickerComponent } from './color-picker/color-picker.component';
import { AutoSizeInputModule } from 'ngx-autosize-input';
import { PropertyRuleComponent } from './property-rule/property-rule.component';
import { ErrorModalComponent } from './popups/error-modal/error-modal.component';
import { AngularDraggableModule } from 'angular2-draggable';
import { GraphTheoreticPropertiesTabComponent } from './operation-tabs/map-tab/graph-theoretic-properties-tab/graph-theoretic-properties-tab.component';

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
    MapTabComponent,
    SettingsTabComponent,
    QueryTabComponent,
    Query0Component,
    GroupTabComponent,
    Query1Component,
    TableViewComponent,
    TimebarMetricEditorComponent,
    ColorPickerComponent,
    PropertyRuleComponent,
    ErrorModalComponent,
    GraphTheoreticPropertiesTabComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    NgbModule,
    AutoSizeInputModule,
    AngularDraggableModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: [SaveAsPngModalComponent, QuickHelpModalComponent, AboutModalComponent, ErrorModalComponent]
})
export class AppModule { }
