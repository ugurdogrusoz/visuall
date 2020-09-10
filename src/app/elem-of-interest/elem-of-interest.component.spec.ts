import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ElemOfInterestComponent } from './elem-of-interest.component';

describe('ElemOfInterestComponent', () => {
  let component: ElemOfInterestComponent;
  let fixture: ComponentFixture<ElemOfInterestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ElemOfInterestComponent ]
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
