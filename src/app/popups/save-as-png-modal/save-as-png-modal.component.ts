import { Component, ViewChild, AfterViewChecked, ElementRef } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CytoscapeService } from '../../cytoscape.service';

@Component({
  selector: 'app-save-as-png-modal',
  templateUrl: './save-as-png-modal.component.html',
  styleUrls: ['./save-as-png-modal.component.css']
})
export class SaveAsPngModalComponent implements AfterViewChecked {

  constructor(public activeModal: NgbActiveModal, public _cyService: CytoscapeService) { }
  @ViewChild('closeBtn', { static: false }) closeBtnRef: ElementRef;

  ngAfterViewChecked() {
    this.closeBtnRef.nativeElement.blur();
  }

  saveWhole() {
    this._cyService.saveAsPng(true);
  }

  saveViewable() {
    this._cyService.saveAsPng(false);
  }

}
