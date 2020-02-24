import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TimebarMetricEditorComponent } from './timebar-metric-editor.component';
import { HttpClientModule } from '@angular/common/http';

describe('TimebarMetricEditorComponent', () => {
  let component: TimebarMetricEditorComponent;
  let fixture: ComponentFixture<TimebarMetricEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TimebarMetricEditorComponent],
      imports: [HttpClientModule]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimebarMetricEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
