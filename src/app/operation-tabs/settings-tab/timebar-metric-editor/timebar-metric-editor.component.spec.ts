import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimebarMetricEditorComponent } from './timebar-metric-editor.component';

describe('TimebarMetricEditorComponent', () => {
  let component: TimebarMetricEditorComponent;
  let fixture: ComponentFixture<TimebarMetricEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimebarMetricEditorComponent ]
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
