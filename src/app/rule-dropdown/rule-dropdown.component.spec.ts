import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RuleDropdownComponent } from './rule-dropdown.component';

describe('RuleDropdownComponent', () => {
  let component: RuleDropdownComponent;
  let fixture: ComponentFixture<RuleDropdownComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RuleDropdownComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RuleDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
