import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SparqlQueryComponent } from './sparql-query.component';

describe('SparqlQueryComponent', () => {
  let component: SparqlQueryComponent;
  let fixture: ComponentFixture<SparqlQueryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SparqlQueryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SparqlQueryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
