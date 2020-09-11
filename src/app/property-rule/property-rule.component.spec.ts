import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { GlobalVariableService } from '../global-variable.service';
import { PropertyRuleComponent } from './property-rule.component';

class GlobalVariableServiceStub { }

describe('PropertyRuleComponent', () => {
  let component: PropertyRuleComponent;
  let fixture: ComponentFixture<PropertyRuleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PropertyRuleComponent],
      providers: [{ provide: GlobalVariableService, useClass: GlobalVariableServiceStub }]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PropertyRuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
