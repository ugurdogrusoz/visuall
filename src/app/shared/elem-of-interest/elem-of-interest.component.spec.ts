import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { GlobalVariableService } from '../../visuall/global-variable.service';
import { ElemOfInterestComponent } from './elem-of-interest.component';

class GlobalVariableServiceStub { }

describe('ElemOfInterestComponent', () => {
  let component: ElemOfInterestComponent;
  let fixture: ComponentFixture<ElemOfInterestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ElemOfInterestComponent],
      providers: [{ provide: GlobalVariableService, useClass: GlobalVariableServiceStub }]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ElemOfInterestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
