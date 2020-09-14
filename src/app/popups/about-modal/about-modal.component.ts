import { Component, OnInit, ViewChild, AfterViewChecked, ElementRef } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import AppDescription from '../../../custom/config/app_description.json';

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
    this.toolName = AppDescription.appInfo.name;
    this.softwareVersion = AppDescription.appInfo.version;
    this.toolLogo = AppDescription.appInfo.icon;
    this.companyName = AppDescription.appInfo.company_name;
    this.companyContact = AppDescription.appInfo.company_contact;
  }

  ngAfterViewChecked() {
    this.closeBtnRef.nativeElement.blur();
  }
}
