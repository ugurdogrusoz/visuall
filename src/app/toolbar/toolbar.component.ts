import { Component, OnInit, ViewChild } from '@angular/core';
import { CytoscapeService } from '../cytoscape.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SaveAsPngModalComponent } from '../popups/save-as-png-modal/save-as-png-modal.component';
import { AboutModalComponent } from '../popups/about-modal/about-modal.component';
import { QuickHelpModalComponent } from '../popups/quick-help-modal/quick-help-modal.component';
import { GlobalVariableService } from '../global-variable.service';
import { getPropNamesFromObj } from '../constants';
import entityMap from '../../assets/generated/properties.json';
import { ToolbarCustomizationService } from './toolbar-customization.service';
import { ToolbarDiv, ToolbarAction } from './itoolbar';
import { EditorComponent } from '../operation-tabs/sparql-query/sparql-editor/editor/editor.component';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent implements OnInit {
  @ViewChild('file', { static: false }) file;
  private searchTxt: string;
  menu: ToolbarDiv[];

  constructor(private _cyService: CytoscapeService, private modalService: NgbModal,
    private _g: GlobalVariableService, private _customizationService: ToolbarCustomizationService) {
    this.menu = [
      {
        div: 0, items: [{ imgSrc: 'assets/img/toolbar/load.svg', title: 'Load', fn: 'load', isStd: true, isRegular: true },
        { imgSrc: 'assets/img/toolbar/json-file.svg', title: 'Save as JSON', fn: 'saveAsJson', isStd: true, isRegular: true },
        { imgSrc: 'assets/img/toolbar/png.svg', title: 'Save as PNG', fn: 'saveAsPng', isStd: true, isRegular: true }]
      },
      {
        div: 1, items: [{ imgSrc: 'assets/img/toolbar/delete-simple.svg', title: 'Delete Selected', fn: 'deleteSelected', isStd: true, isRegular: true },
        { imgSrc: 'assets/img/toolbar/history.svg', title: 'Query History', fn: 'showHideGraphHistory', isStd: true, isRegular: true }]
      },
      {
        div: 2, items: [{ imgSrc: 'assets/img/toolbar/hide-selected.svg', title: 'Hide Selected', fn: 'hideSelected', isStd: true, isRegular: true },
        { imgSrc: 'assets/img/toolbar/show-all.svg', title: 'Show All', fn: 'showAll', isStd: true, isRegular: true }]
      },
      {
        div: 3, items: [{ imgSrc: 'assets/img/toolbar/search.svg', title: 'Search to Highlight', fn: 'highlightSearch', isStd: true, isRegular: true },
        { imgSrc: '', title: 'must be hard coded to HTML', fn: '', isStd: true, isRegular: false },
        { imgSrc: 'assets/img/toolbar/highlight-selected.svg', title: 'Highlight Selected', fn: 'highlightSelected', isStd: true, isRegular: true },
        { imgSrc: 'assets/img/toolbar/remove-highlights.svg', title: 'Remove Highlights', fn: 'removeHighlights', isStd: true, isRegular: true }]
      },
      {
        div: 4, items: [{ imgSrc: 'assets/img/toolbar/layout-cose.svg', title: 'Perform Layout', fn: 'performLayout', isStd: true, isRegular: true },
        { imgSrc: 'assets/img/toolbar/layout-static.svg', title: 'Recalculate Layout', fn: 'reLayout', isStd: true, isRegular: true }]
      },
      {
        div: 5, items: [{ imgSrc: 'assets/img/toolbar/quick-help.svg', title: 'Quick help', fn: 'openQuickHelp', isStd: true, isRegular: true },
        { imgSrc: 'assets/img/toolbar/about.svg', title: 'About', fn: 'openAbout', isStd: true, isRegular: true }]
      },
      {
        div: 6, items: [{ imgSrc: 'assets/img/toolbar/texteditor.svg', title: 'Sparql Editor', fn: 'openEditor', isStd: true, isRegular: true }]
      },
    ];
  }

  ngOnInit() {
    this.mergeCustomMenu();
  }

  ngAfterViewInit() {
    // angular rendering harms previous manual positioning
    this._cyService.setNavigatorPosition();
  }

  mergeCustomMenu() {
    let m = this._customizationService.menu;
    // in any case, set isStd property to false
    m.map(x => x.items.map(y => y.isStd = false));

    for (let i = 0; i < m.length; i++) {
      let idx = this.menu.findIndex(x => x.div == m[i].div);
      if (idx == -1) {
        this.menu.push(m[i]);
      } else {
        this.menu[idx].items.push(...m[i].items);
      }
    }
  }

  fileSelected() { this._cyService.loadFile(this.file.nativeElement.files[0]); }

  triggerAct(act: ToolbarAction) {
    if (act.isStd) {
      this[act.fn]();
    } else {
      this._customizationService[act.fn]();
    }
  }

  load() {
    this.file.nativeElement.value = '';
    this.file.nativeElement.click();
  }

  saveAsJson() { this._cyService.saveAsJson(); }

  saveAsPng() { this.modalService.open(SaveAsPngModalComponent); }

  deleteSelected() { this._cyService.deleteSelected(null); }

  hideSelected() { this._cyService.showHideSelectedElements(true); }

  showAll() { this._cyService.showHideSelectedElements(false); }

  highlightSearch() {
    const q = this.generateCyQueryForStrSearch(this.searchTxt);
    let e1 = this.findInListProps(this.searchTxt);
    let e2 = this._g.cy.$(q);
    let e3 = this.searchNumberProps(this.searchTxt);
    this._g.highlightElems(e1.union(e2).union(e3))
  }

  generateCyQueryForStrSearch(pattern) {
    const propNames = getPropNamesFromObj([entityMap.nodes, entityMap.edges], ['string']);
    let cyQuery = '';
    let caseInsensitive = '';
    if (this._g.userPrefs.isIgnoreCaseInText.getValue()) {
      caseInsensitive = '@'
    }
    for (let name of Array.from(propNames)) {
      cyQuery += `[${name} ${caseInsensitive}*= "${pattern}"],`
    }
    // delete last
    cyQuery = cyQuery.substr(0, cyQuery.length - 1);
    return cyQuery;
  }

  findInListProps(txt) {
    const listPropNames = getPropNamesFromObj([entityMap.nodes, entityMap.edges], ['list']);
    return this._g.cy.filter(function (e) {
      let d = e.data();

      for (let propName of Array.from(listPropNames)) {
        let prop = d[propName];
        if (!prop) {
          continue;
        }
        for (let i = 0; i < prop.length; i++) {
          if (prop[i].toLowerCase().includes(txt.toLowerCase())) {
            return true;
          }
        }
      }
      return false;
    });
  }

  searchNumberProps(txt: string) {
    let n = Number(txt);
    if (!n) {
      return this._g.cy.collection();
    }
    const propNames = getPropNamesFromObj([entityMap.nodes, entityMap.edges], ['int', 'float']);
    let cyQuery = '';
    for (let name of Array.from(propNames)) {
      cyQuery += `[${name} = ${n}],`
    }
    // delete last
    cyQuery = cyQuery.substr(0, cyQuery.length - 1);
    return this._g.cy.$(cyQuery);
  }

  highlightSelected() { this._cyService.highlightSelected(); }

  removeHighlights() { this._cyService.removeHighlights(); }

  performLayout() { this._g.performLayout(false, true); }

  reLayout() { this._g.performLayout(true); }

  openQuickHelp() { this.modalService.open(QuickHelpModalComponent); }

  openAbout() { this.modalService.open(AboutModalComponent); }
  
  openEditor(){this.modalService.open(EditorComponent)}


  showHideGraphHistory() {
    const v = this._g.showHideGraphHistory.getValue();
    this._g.showHideGraphHistory.next(!v);
  }
}
