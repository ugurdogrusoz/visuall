import { Component, OnInit, ViewChild } from '@angular/core';
import { CytoscapeService } from '../cytoscape.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SaveAsPngModalComponent } from '../popups/save-as-png-modal/save-as-png-modal.component';
import { AboutModalComponent } from '../popups/about-modal/about-modal.component';
import { QuickHelpModalComponent } from '../popups/quick-help-modal/quick-help-modal.component';
import { GlobalVariableService } from '../global-variable.service';
import { HIGHLIGHT_TYPE, getPropNamesFromObj } from '../constants';
import entityMap from '../../assets/generated/properties.json';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent implements OnInit {
  @ViewChild('file', { static: false }) file;
  searchTxt: string;

  constructor(private _cyService: CytoscapeService, private modalService: NgbModal, private _g: GlobalVariableService) { }

  ngOnInit() {
  }

  load() {
    this.file.nativeElement.value = '';
    this.file.nativeElement.click();
  }

  fileSelected() {
    this._cyService.loadFile(this.file.nativeElement.files[0]);
  }

  saveAsJson() {
    this._cyService.saveAsJson();
  }

  saveAsPng() {
    this.modalService.open(SaveAsPngModalComponent);
  }

  deleteSelected() {
    this._cyService.deleteSelected(null);
  }

  showHideSelected(isHide: boolean) {
    this._cyService.showHideSelectedElements(isHide);
  }

  highlightSearch() {
    const q = this.generateCyQueryForStrSearch(this.searchTxt);

    let e1 = this.findInListProps(this.searchTxt);
    let e2 = this._g.cy.$(q);
    let options = { eles: e1.union(e2), option: HIGHLIGHT_TYPE };
    this._g.viewUtils.highlight(options);
  }

  generateCyQueryForStrSearch(pattern) {
    const propNames = getPropNamesFromObj([entityMap.nodes, entityMap.edges], ['string']);
    let cyQuery = '';
    let caseInsensitive = '';
    if (this._g.isIgnoreCaseInText) {
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

  highlightSelected() {
    this._cyService.highlightSelected();
  }

  highlightRemove() {
    this._cyService.highlightRemove();
  }

  performLayout(isRandomize: boolean) {
    this._g.performLayout(isRandomize);
  }

  quickHelp() {
    this.modalService.open(QuickHelpModalComponent);
  }

  about() {
    this.modalService.open(AboutModalComponent);
  }
}
