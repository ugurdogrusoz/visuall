import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertyRuleComponent } from './property-rule.component';

describe('PropertyRuleComponent', () => {
  let component: PropertyRuleComponent;
  let fixture: ComponentFixture<PropertyRuleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PropertyRuleComponent ]
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
