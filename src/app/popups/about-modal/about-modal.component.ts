import { Component, OnInit, ViewChild, AfterViewChecked, ElementRef } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { GlobalVariableService } from 'src/app/global-variable.service';

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

  constructor(public activeModal: NgbActiveModal, private _g: GlobalVariableService) { }

  ngOnInit() {
    this._g.appDescription.subscribe(x => {
      if (x) {
        this.toolName = x.appInfo.name;
        this.softwareVersion = x.appInfo.version;
        this.toolLogo = x.appInfo.icon;
        this.companyName = x.appInfo.company_name;
        this.companyContact = x.appInfo.company_contact;
      }
    });
  }

  ngAfterViewChecked() {
    this.closeBtnRef.nativeElement.blur();
  }
}
