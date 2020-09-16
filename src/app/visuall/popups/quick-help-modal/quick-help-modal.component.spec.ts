import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { QuickHelpModalComponent } from './quick-help-modal.component';

describe('QuickHelpModalComponent', () => {
  let component: QuickHelpModalComponent;
  let fixture: ComponentFixture<QuickHelpModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [QuickHelpModalComponent],
      providers: [NgbActiveModal]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuickHelpModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
