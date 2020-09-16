import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { Query0Component } from './query0.component';

describe('Query0Component', () => {
  let component: Query0Component;
  let fixture: ComponentFixture<Query0Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [Query0Component],
      imports: [FormsModule, HttpClientModule]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Query0Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});