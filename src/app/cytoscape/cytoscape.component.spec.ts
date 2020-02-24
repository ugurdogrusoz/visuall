import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';

import { CytoscapeComponent } from './cytoscape.component';
import { CytoscapeService } from '../cytoscape.service';
import { TimebarService } from '../timebar.service';

class CytoscapeServiceStub {
  initCy() { }
}
class TimebarServiceStub {
  init() { }
}

describe('CytoscapeComponent', () => {
  let component: CytoscapeComponent;
  let fixture: ComponentFixture<CytoscapeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CytoscapeComponent],
      providers: [
        { provide: CytoscapeService, useClass: CytoscapeServiceStub },
        { provide: TimebarService, useClass: TimebarServiceStub },
      ],
      imports: [HttpClientModule]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CytoscapeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
