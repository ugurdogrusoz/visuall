import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RuleTreeComponent } from './rule-tree.component';

describe('RuleTreeComponent', () => {
  let component: RuleTreeComponent;
  let fixture: ComponentFixture<RuleTreeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RuleTreeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RuleTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
