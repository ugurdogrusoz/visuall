import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';

import { CytoscapeComponent } from './cytoscape.component';
import { CytoscapeService } from '../cytoscape.service';
import { GlobalVariableService } from '../global-variable.service';
import { MarqueeZoomService } from './marquee-zoom.service';
import { ContextMenuService } from '../context-menu/context-menu.service';

class CytoscapeServiceStub { initCy() { } }
class GlobalVariableServiceStub { }
class ContextMenuServiceStub { }
class MarqueeZoomServiceStub { }

describe('CytoscapeComponent', () => {
  let component: CytoscapeComponent;
  let fixture: ComponentFixture<CytoscapeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CytoscapeComponent],
      providers: [
        { provide: CytoscapeService, useClass: CytoscapeServiceStub },
        { provide: GlobalVariableService, useClass: GlobalVariableServiceStub },
        { provide: ContextMenuService, useClass: ContextMenuServiceStub },
        { provide: MarqueeZoomService, useClass: MarqueeZoomServiceStub },
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
