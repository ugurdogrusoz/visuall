import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Neo4jDb } from '../../db-service/neo4j-db.service';
import { TimebarService } from '../../timebar.service';
import { GlobalVariableService } from '../../global-variable.service';
import { CytoscapeService } from '../../cytoscape.service';
import { MapTabComponent } from './map-tab.component';

class CytoscapeServiceStub { }
class DbServiceStub { }
class GlobalVariableServiceStub { }
class TimebarServiceStub { }

describe('FilterTabComponent', () => {
  let component: MapTabComponent;
  let fixture: ComponentFixture<MapTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MapTabComponent ],
      imports: [FormsModule],
      providers: [
        { provide: CytoscapeService, useClass: CytoscapeServiceStub },
        { provide: Neo4jDb, useClass: DbServiceStub },
        { provide: GlobalVariableService, useClass: GlobalVariableServiceStub },
        { provide: TimebarService, useClass: TimebarServiceStub },
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
