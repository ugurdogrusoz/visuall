import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { QueryTabComponent } from './query-tab.component';
import { HttpClientModule } from '@angular/common/http';

describe('QueryTabComponent', () => {
  let component: QueryTabComponent;
  let fixture: ComponentFixture<QueryTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [QueryTabComponent],
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
