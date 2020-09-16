import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { GraphHistoryComponent } from './graph-history.component';

describe('GraphHistoryComponent', () => {
  let component: GraphHistoryComponent;
  let fixture: ComponentFixture<GraphHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [GraphHistoryComponent],
      imports: [HttpClientTestingModule]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GraphHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
