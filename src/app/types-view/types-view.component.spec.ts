import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TypesViewComponent } from './types-view.component';

describe('TypesViewComponent', () => {
  let component: TypesViewComponent;
  let fixture: ComponentFixture<TypesViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TypesViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TypesViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
