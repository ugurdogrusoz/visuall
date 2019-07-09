import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { QueryTabComponent } from './query-tab.component';
import { Query0Component } from './query0/query0.component';
import { Query1Component } from './query1/query1.component';
import { HttpClientModule } from '@angular/common/http';

describe('QueryTabComponent', () => {
  let component: QueryTabComponent;
  let fixture: ComponentFixture<QueryTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [QueryTabComponent, Query0Component, Query1Component],
      imports: [FormsModule, HttpClientModule]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QueryTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
