import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { Query1Component } from './query1.component';

describe('Query1Component', () => {
  let component: Query1Component;
  let fixture: ComponentFixture<Query1Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Query1Component ],
      imports: [FormsModule, HttpClientModule]

    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Query1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});