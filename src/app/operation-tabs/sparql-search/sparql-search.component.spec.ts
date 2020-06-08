import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SparqlSearchComponent } from './sparql-search.component';

describe('SparqlSearchComponent', () => {
  let component: SparqlSearchComponent;
  let fixture: ComponentFixture<SparqlSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SparqlSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SparqlSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
