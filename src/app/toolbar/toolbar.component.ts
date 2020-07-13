import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
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
import {MapModalComponent} from '../popups/map-modal/map-modal.component';


@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent implements OnInit, AfterViewInit {
  @ViewChild('file', { static: false }) file;
  private searchTxt: string;
  menu: ToolbarDiv[];
  statusMsg = '';
  statusMsgQueue: string[] = [];
  MIN_MSG_DURATION = 500;
  msgQueueUpdater = null;

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
      {
        div: 7, items: [{ imgSrc: 'assets/img/toolbar/map.svg', title: 'Show On Map', fn: 'showOnMap', isStd: true, isRegular: true }]
      }
    ];
  }

  ngOnInit() {
    this.mergeCustomMenu();
    this._g.statusMsg.subscribe(x => {
      if (this.statusMsgQueue[this.statusMsgQueue.length - 1] !== x) {
        this.statusMsgQueue.push(x);
      }
      if (this.msgQueueUpdater) {
        return;
      }
      this.processMsgQueue();
      this.msgQueueUpdater = setInterval(this.processMsgQueue.bind(this), this.MIN_MSG_DURATION);
    });
  }

  private processMsgQueue() {
    if (this.statusMsgQueue.length < 1) {
      clearInterval(this.msgQueueUpdater);
      this.statusMsg = '';
      this.msgQueueUpdater = null;
      return;
    }
    let candidateMsg = this.statusMsgQueue.shift();
    // skip the same messages if there are new ones
    while (candidateMsg == this.statusMsg && this.statusMsgQueue.length > 0) {
      candidateMsg = this.statusMsgQueue.shift();
    }
    this.statusMsg = candidateMsg;
  }

  ngAfterViewInit() {
    // angular rendering harms previous manual positioning
    this._cyService.setNavigatorPosition();
  }

  mergeCustomMenu() {
    const m = this._customizationService.menu;
    // in any case, set isStd property to false
    m.map(x => x.items.map(y => y.isStd = false));

    for (const i of m) {
      const idx = this.menu.findIndex(x => x.div === i.div);
      if (idx === -1) {
        this.menu.push(i);
      } else {
        this.menu[idx].items.push(...i.items);
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
    const e1 = this.findInListProps(this.searchTxt);
    const e2 = this._g.cy.$(q);
    const e3 = this.searchNumberProps(this.searchTxt);
    this._g.highlightElems(e1.union(e2).union(e3))
  }

  generateCyQueryForStrSearch(pattern) {
    const propNames = getPropNamesFromObj([entityMap.nodes, entityMap.edges], ['string']);
    let cyQuery = '';
    let caseInsensitive = '';
    if (this._g.userPrefs.isIgnoreCaseInText.getValue()) {
      caseInsensitive = '@'
    }
    for (const name of Array.from(propNames)) {
      cyQuery += `[${name} ${caseInsensitive}*= "${pattern}"],`
    }
    // delete last
    cyQuery = cyQuery.substr(0, cyQuery.length - 1);
    return cyQuery;
  }

  findInListProps(txt) {
    const listPropNames = getPropNamesFromObj([entityMap.nodes, entityMap.edges], ['list']);
    return this._g.cy.filter(function (e) {
      const d = e.data();

      for (const propName of Array.from(listPropNames)) {
        const prop = d[propName];
        if (!prop) {
          continue;
        }
        for (const p of prop) {
          if (p.toLowerCase().includes(txt.toLowerCase())) {
            return true;
          }
        }
      }
      return false;
    });
  }

  searchNumberProps(txt: string) {
    const n = Number(txt);
    if (!n) {
      return this._g.cy.collection();
    }
    const propNames = getPropNamesFromObj([entityMap.nodes, entityMap.edges], ['int', 'float']);
    let cyQuery = '';
    for (const name of Array.from(propNames)) {
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

  showOnMap() {this.modalService.open(MapModalComponent, { keyboard: true, size: 'xl' }); }

}
