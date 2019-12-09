import { Component, OnInit, ViewChild, AfterViewChecked, ElementRef } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'app-error-modal',
  templateUrl: './error-modal.component.html',
  styleUrls: ['./error-modal.component.css']
})
export class ErrorModalComponent implements OnInit, AfterViewChecked {
  @ViewChild('closeBtn', { static: false }) closeBtnRef: ElementRef;

  constructor(public activeModal: NgbActiveModal) { }
  
  ngOnInit() {
  }

  ngAfterViewChecked() {
    this.closeBtnRef.nativeElement.blur();
  }

}
