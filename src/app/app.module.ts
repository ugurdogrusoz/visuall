import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule } from '@angular/router';
import {APP_BASE_HREF} from '@angular/common';
import {ReactiveFormsModule} from '@angular/forms'
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
import { GroupTabComponent } from './operation-tabs/map-tab/group-tab/group-tab.component';
import { TableViewComponent, ReplacePipe } from './table-view/table-view.component';
import { TimebarMetricEditorComponent } from './operation-tabs/settings-tab/timebar-metric-editor/timebar-metric-editor.component';
import { ColorPickerComponent } from './color-picker/color-picker.component';
import { AutoSizeInputModule } from 'ngx-autosize-input';
import { PropertyRuleComponent } from './property-rule/property-rule.component';
import { ErrorModalComponent } from './popups/error-modal/error-modal.component';
import { AngularDraggableModule } from 'angular2-draggable';
import { GraphTheoreticPropertiesTabComponent } from './operation-tabs/map-tab/graph-theoretic-properties-tab/graph-theoretic-properties-tab.component';
import { GraphHistoryComponent } from './graph-history/graph-history.component';
import { TabCustomizationModule } from './operation-tabs/tab-customization/tab-customization.module';
import { SaveProfileModalComponent } from './popups/save-profile-modal/save-profile-modal.component';
import { SparqlQueryComponent } from './operation-tabs/sparql-query/sparql-query.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RecommendComponent } from './operation-tabs/recommend/recommend.component';
import { AdvancedQueriesComponent } from './operation-tabs/query-tab/advanced-queries/advanced-queries.component';
import { TypesViewComponent } from './types-view/types-view.component';
import { RuleTreeComponent } from './rule-tree/rule-tree.component';
import { RuleDropdownComponent } from './rule-dropdown/rule-dropdown.component';

import{NzConfig, NZ_CONFIG} from 'ng-zorro-antd/core/config';
import { NzInputModule } from 'ng-zorro-antd/input';
import{NgZorroAntdModule, NzAutocompleteModule} from 'ng-zorro-antd';
import { SparqlSearchComponent } from './operation-tabs/sparql-search/sparql-search.component';
import { EditorComponent } from './operation-tabs/sparql-query/sparql-editor/editor/editor.component';
import { MapModalComponent } from './popups/map-modal/map-modal.component';

const ngZorroConfig: NzConfig = {
  message: { nzTop: 120 },
  notification: { nzTop: 240 }
};


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
    GroupTabComponent,
    TableViewComponent,
    TimebarMetricEditorComponent,
    ColorPickerComponent,
    PropertyRuleComponent,
    ErrorModalComponent,
    GraphTheoreticPropertiesTabComponent,
    GraphHistoryComponent,
    SaveProfileModalComponent,
    ReplacePipe,
    AdvancedQueriesComponent,
    TypesViewComponent,
    RuleTreeComponent,
    SparqlQueryComponent,
    RecommendComponent,
    SparqlSearchComponent,
    EditorComponent,
    MapModalComponent,
    RuleDropdownComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    NgbModule,
    AutoSizeInputModule,
    AngularDraggableModule,
    TabCustomizationModule,
    RouterModule.forRoot([]),
    TabCustomizationModule,
    BrowserAnimationsModule,
    NgZorroAntdModule,
    ReactiveFormsModule,
    NzInputModule,
    NzAutocompleteModule
  ],
  providers: [{provide: APP_BASE_HREF, useValue : "/" }, {provide: NZ_CONFIG, useValue: ngZorroConfig}],
  bootstrap: [AppComponent],
  entryComponents: [SaveAsPngModalComponent, QuickHelpModalComponent, AboutModalComponent, ErrorModalComponent]
})
export class AppModule { }
