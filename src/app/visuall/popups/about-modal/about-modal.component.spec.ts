import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { GlobalVariableService } from '../../../visuall/global-variable.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AboutModalComponent } from './about-modal.component';

class GlobalVariableServiceStub { }

describe('AboutModalComponent', () => {
  let component: AboutModalComponent;
  let fixture: ComponentFixture<AboutModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [AboutModalComponent],
      providers: [NgbActiveModal, { provide: GlobalVariableService, useClass: GlobalVariableServiceStub }]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AboutModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
