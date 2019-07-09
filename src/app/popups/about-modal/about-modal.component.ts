import { Component, OnInit, ViewChild, AfterViewChecked, ElementRef } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import ModelDescription from '../../../../src/model_description.json';

@Component({
  selector: 'app-about-modal',
  templateUrl: './about-modal.component.html',
  styleUrls: ['./about-modal.component.css']
})
export class AboutModalComponent implements OnInit, AfterViewChecked {
  @ViewChild('closeBtn', { static: false }) closeBtnRef: ElementRef;
  toolName: string;
  softwareVersion: string;
  toolLogo: string;
  companyName: string;
  companyContact: string;

  constructor(public activeModal: NgbActiveModal) { }

  ngOnInit() {
    this.toolName = ModelDescription.template.name;
    this.softwareVersion = ModelDescription.template.version;
    this.toolLogo = ModelDescription.template.icon;
    this.companyName = ModelDescription.template.company_name;
    this.companyContact = ModelDescription.template.company_contact;
  }

  ngAfterViewChecked() {
    this.closeBtnRef.nativeElement.blur();
  }
}
