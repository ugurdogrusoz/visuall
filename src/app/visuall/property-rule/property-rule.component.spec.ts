import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { GlobalVariableService } from '../global-variable.service';
import { RuleSync } from '../operation-tabs/map-tab/query-types';
import { PropertyRuleComponent } from './property-rule.component';
import cytoscape from 'cytoscape';

class GlobalVariableServiceStub { cy = cytoscape(); }

describe('PropertyRuleComponent', () => {
  let component: PropertyRuleComponent;
  let fixture: ComponentFixture<PropertyRuleComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [PropertyRuleComponent],
      providers: [{ provide: GlobalVariableService, useClass: GlobalVariableServiceStub }]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PropertyRuleComponent);
    component = fixture.componentInstance;
    component.propertyChanged = new Subject<RuleSync>();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
