import { Component, OnInit, ViewChild } from '@angular/core';
import { DbAdapterService } from '../db-service/db-adapter.service';
import { GlobalVariableService } from '../global-variable.service';
import { CytoscapeService } from '../cytoscape.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SaveAsPngModalComponent } from '../popups/save-as-png-modal/save-as-png-modal.component';
import { AboutModalComponent } from '../popups/about-modal/about-modal.component';
import { QuickHelpModalComponent } from '../popups/quick-help-modal/quick-help-modal.component';
import * as $ from 'jquery';
import AppDescription from '../../assets/app_description.json';
import { NavbarCustomizationService } from './navbar-customization.service';
import { NavbarDropdown, NavbarAction } from './inavbar';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  @ViewChild('file', { static: false }) file;

  menu: NavbarDropdown[];
  closeResult: string;
  toolName: string;
  toolLogo: string;

  constructor(private _dbService: DbAdapterService, private _cyService: CytoscapeService, private _modalService: NgbModal,
    private _g: GlobalVariableService, private _customizationService: NavbarCustomizationService) {
    this.menu = [
      {
        dropdown: 'File', actions: [{ txt: 'Load...', id: 'nbi00', fn: 'loadFile', isStd: true },
        { txt: 'Save as JSON', id: 'nbi01', fn: 'saveAsJson', isStd: true },
        { txt: 'Save as PNG...', id: 'nbi02', fn: 'saveAsPng', isStd: true }]
      },
      {
        dropdown: 'Edit', actions: [{ txt: 'Delete Selected', id: 'nbi10', fn: 'deleteSelected', isStd: true },
        { txt: 'Graph History', id: 'nbi101', fn: 'showHideGraphHistory', isStd: true }]
      },
      {
        dropdown: 'View', actions: [
          { txt: 'Hide Selected', id: 'nbi20', fn: 'hideSelected', isStd: true },
          { txt: 'Hide Unselected', id: 'nbi20', fn: 'hideUnselected', isStd: true },
          { txt: 'Show All', id: 'nbi21', fn: 'showAll', isStd: true }
        ]
      },
      {
        dropdown: 'Highlight', actions: [{ txt: 'Search...', id: 'nbi30', fn: 'search2Highlight', isStd: true },
        { txt: 'Selected', id: 'nbi31', fn: 'highlightSelected', isStd: true },
        { txt: 'Neighbors of Selected', id: 'nbi32', fn: 'highlightNeighborsOfSelected', isStd: true },
        { txt: 'Remove Highlights', id: 'nbi33', fn: 'removeHighlights', isStd: true }]
      },
      {
        dropdown: 'Layout', actions: [{ txt: 'Perform Layout', id: 'nbi40', fn: 'doLayout', isStd: true },
        { txt: 'Recalculate Layout', id: 'nbi41', fn: 'recalculateLayout', isStd: true }]
      },
      {
        dropdown: 'Help', actions: [{ txt: 'Quick Help', id: 'nbi50', fn: 'openQuickHelp', isStd: true },
        { txt: 'About', id: 'nbi51', fn: 'openAbout', isStd: true }]
      },
      {
        dropdown: 'Data', actions: [{ txt: 'Sample Data', id: 'nbi60', fn: 'getSampleData', isStd: true },
        { txt: 'All Data', id: 'nbi61', fn: 'getAllData', isStd: true },
        { txt: 'Clear Data', id: 'nbi62', fn: 'clearData', isStd: true }]
      }
    ];
  }

  ngOnInit() {
    this.toolName = AppDescription.appInfo.name;
    this.toolLogo = AppDescription.appInfo.icon;
    this.mergeCustomMenu();
  }

  mergeCustomMenu() {
    let m = this._customizationService.menu;
    // in any case, set isStd property to false
    m.map(x => x.actions.map(y => y.isStd = false));

    for (let i = 0; i < m.length; i++) {
      let idx = this.menu.findIndex(x => x.dropdown == m[i].dropdown);
      if (idx == -1) {
        this.menu.push(m[i]);
      } else {
        this.menu[idx].actions.push(...m[i].actions);
      }
    }
  }

  fileSelected() {
    this._cyService.loadFile(this.file.nativeElement.files[0]);
  }

  triggerAct(act: NavbarAction) {
    if (act.isStd) {
      this[act.fn]();
    } else {
      this._customizationService[act.fn]();
    }
  }

  loadFile() {
    this.file.nativeElement.value = '';
    this.file.nativeElement.click();
  }

  saveAsJson() { this._cyService.saveAsJson(); }

  saveAsPng() { this._modalService.open(SaveAsPngModalComponent); }

  deleteSelected() { this._cyService.deleteSelected(null); }

  hideSelected() { this._cyService.showHideSelectedElements(true); }

  hideUnselected() { this._cyService.hideUnselected(); }

  showAll() { this._cyService.showHideSelectedElements(false); }

  search2Highlight() { $('#highlight-search-inp').focus(); }

  highlightSelected() { this._cyService.highlightSelected(); }

  highlightNeighborsOfSelected() { this._cyService.staticHighlightNeighbors(); }

  removeHighlights() { this._cyService.removeHighlights(); }

  doLayout() { this._g.performLayout(false, true); }

  recalculateLayout() { this._g.performLayout(true); }

  openQuickHelp() { this._modalService.open(QuickHelpModalComponent); }

  openAbout() { this._modalService.open(AboutModalComponent); }

  getSampleData() {
    this._dbService.getSampleData(x => { this._cyService.loadElementsFromDatabase(x, false) });
  }

  getAllData() {
    this._dbService.getAllData(x => { this._cyService.loadElementsFromDatabase(x, false) });
  }

  clearData() {
    this._g.cy.remove(this._g.cy.$());
  }

  showHideGraphHistory() {
    const v = this._g.showHideGraphHistory.getValue();
    this._g.showHideGraphHistory.next(!v);
  }

}

