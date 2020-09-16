import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';

import { GraphTheoreticPropertiesTabComponent } from './graph-theoretic-properties-tab.component';

describe('GraphTheoreticPropertiesTabComponent', () => {
  let component: GraphTheoreticPropertiesTabComponent;
  let fixture: ComponentFixture<GraphTheoreticPropertiesTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [GraphTheoreticPropertiesTabComponent],
      imports: [HttpClientModule]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GraphTheoreticPropertiesTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
