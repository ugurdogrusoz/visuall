import { Component, OnInit, ViewChild } from '@angular/core';
import { DbService } from '../db.service';
import { GlobalVariableService } from '../global-variable.service';
import { CytoscapeService } from '../cytoscape.service';
import { SAMPLE_DATA_CQL, GET_ALL_CQL } from '../constants';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SaveAsPngModalComponent } from '../popups/save-as-png-modal/save-as-png-modal.component';
import { AboutModalComponent } from '../popups/about-modal/about-modal.component';
import { QuickHelpModalComponent } from '../popups/quick-help-modal/quick-help-modal.component';
import * as $ from 'jquery';
import ModelDescription from '../../../src/model_description.json';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  @ViewChild('file', { static: false }) file;

  menu: any[];
  closeResult: string;
  toolName: string;
  toolLogo: string;

  constructor(private _dbService: DbService, private _cyService: CytoscapeService, private modalService: NgbModal, private _g: GlobalVariableService) { }

  ngOnInit() {
    this.toolName = ModelDescription.template.name;
    this.toolLogo = ModelDescription.template.icon;

    this.menu = [{ dropdown: 'File', actions: [{ txt: 'Load...', id: 'nbi00' }, { txt: 'Save as JSON', id: 'nbi01' }, { txt: 'Save as PNG...', id: 'nbi02' }] },
    { dropdown: 'Edit', actions: [{ txt: 'Delete Selected', id: 'nbi10' }] },
    { dropdown: 'View', actions: [{ txt: 'Hide Selected', id: 'nbi20' }, { txt: 'Show All', id: 'nbi21' }] },
    { dropdown: 'Highlight', actions: [{ txt: 'Search...', id: 'nbi30' }, { txt: 'Selected', id: 'nbi31' }, { txt: 'Neighbors of Selected', id: 'nbi32' }, { txt: 'Remove Highlights', id: 'nbi33' }] },
    { dropdown: 'Layout', actions: [{ txt: 'Perform Layout', id: 'nbi40' }, { txt: 'Recalculate Layout', id: 'nbi41' }] },
    { dropdown: 'Help', actions: [{ txt: 'Quick Help', id: 'nbi50' }, { txt: 'About', id: 'nbi51' }] },
    { dropdown: 'Data', actions: [{ txt: 'Sample Data', id: 'nbi60' }, { txt: 'All Data', id: 'nbi61' }, { txt: 'Clear Data', id: 'nbi62' }] }
    ];
  }

  getSampleData() {
  }

  triggerAct(act) {
    console.log(' act: ', act);
    // menu 0
    if (act === this.menu[0].actions[0]) {
      this.file.nativeElement.value = '';
      this.file.nativeElement.click();
    } else if (act == this.menu[0].actions[1]) {
      this._cyService.saveAsJson();
    } else if (act == this.menu[0].actions[2]) {
      this.modalService.open(SaveAsPngModalComponent);
    }
    // menu 1
    else if (act === this.menu[1].actions[0]) {
      this._cyService.deleteSelected(null);
    }
    // menu 2
    else if (act === this.menu[2].actions[0]) {
      this._cyService.showHideSelectedElements(true);
    }
    else if (act === this.menu[2].actions[1]) {
      this._cyService.showHideSelectedElements(false);
    }
    // menu 3
    else if (act === this.menu[3].actions[0]) {
      $('#highlight-search-inp').focus();
    }
    else if (act === this.menu[3].actions[1]) {
      this._cyService.highlightSelected();
    }
    else if (act === this.menu[3].actions[2]) {
      this._cyService.staticHighlightNeighbors();
    }
    else if (act === this.menu[3].actions[3]) {
      this._cyService.highlightRemove();
    }
    // menu 4
    else if (act === this.menu[4].actions[0]) {
      this._g.performLayout(false);
    }
    else if (act === this.menu[4].actions[1]) {
      this._g.performLayout(true);
    }
    // menu 5
    else if (act === this.menu[5].actions[0]) {
      this.modalService.open(QuickHelpModalComponent);
    }
    else if (act === this.menu[5].actions[1]) {
      this.modalService.open(AboutModalComponent);
    }
    // menu 6
    else if (act === this.menu[6].actions[0]) {
      this._dbService.runQuery(SAMPLE_DATA_CQL, null, (response) => this._cyService.loadElementsFromDatabase(response, false));
    } else if (act === this.menu[6].actions[1]) {
      this._dbService.runQuery(GET_ALL_CQL, null, (response) => this._cyService.loadElementsFromDatabase(response, false));
    } else if (act === this.menu[6].actions[2]) {
      this._g.cy.remove(this._g.cy.$());
    }
  }

  fileSelected() {
    this._cyService.loadFile(this.file.nativeElement.files[0]);
  }
}
