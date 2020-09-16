import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule } from '@angular/router';
import { APP_BASE_HREF } from '@angular/common';

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
import { TimebarMetricEditorComponent } from './operation-tabs/settings-tab/timebar-metric-editor/timebar-metric-editor.component';
import { ColorPickerComponent } from './color-picker/color-picker.component';
import { AutoSizeInputModule } from 'ngx-autosize-input';
import { PropertyRuleComponent } from './property-rule/property-rule.component';
import { ErrorModalComponent } from './popups/error-modal/error-modal.component';
import { AngularDraggableModule } from 'angular2-draggable';
import { GraphTheoreticPropertiesTabComponent } from './operation-tabs/map-tab/graph-theoretic-properties-tab/graph-theoretic-properties-tab.component';
import { GraphHistoryComponent } from './graph-history/graph-history.component';
import { SaveProfileModalComponent } from './popups/save-profile-modal/save-profile-modal.component';
import { AdvancedQueriesComponent } from './operation-tabs/query-tab/advanced-queries/advanced-queries.component';
import { TypesViewComponent } from './types-view/types-view.component';
import { RuleTreeComponent } from './rule-tree/rule-tree.component';
import { RuleDropdownComponent } from './rule-dropdown/rule-dropdown.component';
import { ElemOfInterestComponent } from './elem-of-interest/elem-of-interest.component';
import { SharedModule } from '../shared/shared.module';
import { CustomizationModule } from '../custom/customization.module';

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
    TimebarMetricEditorComponent,
    ColorPickerComponent,
    PropertyRuleComponent,
    ErrorModalComponent,
    GraphTheoreticPropertiesTabComponent,
    GraphHistoryComponent,
    SaveProfileModalComponent,
    AdvancedQueriesComponent,
    TypesViewComponent,
    RuleTreeComponent,
    RuleDropdownComponent,
    ElemOfInterestComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    NgbModule,
    AutoSizeInputModule,
    AngularDraggableModule,
    CustomizationModule,
    SharedModule,
    RouterModule.forRoot([]),
  ],
  providers: [{ provide: APP_BASE_HREF, useValue: "/" }],
  bootstrap: [AppComponent],
  entryComponents: [SaveAsPngModalComponent, QuickHelpModalComponent, AboutModalComponent, ErrorModalComponent]
})
export class AppModule { }
