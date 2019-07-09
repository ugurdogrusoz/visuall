import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { DbService } from '../../db.service';
import { TimebarService } from '../../timebar.service';
import { GlobalVariableService } from '../../global-variable.service';
import { CytoscapeService } from '../../cytoscape.service';
import { FilterTabComponent } from './filter-tab.component';

class CytoscapeServiceStub { }
class DbServiceStub { }
class GlobalVariableServiceStub { }
class TimebarServiceStub { }

describe('FilterTabComponent', () => {
  let component: FilterTabComponent;
  let fixture: ComponentFixture<FilterTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FilterTabComponent ],
      imports: [FormsModule],
      providers: [
        { provide: CytoscapeService, useClass: CytoscapeServiceStub },
        { provide: DbService, useClass: DbServiceStub },
        { provide: GlobalVariableService, useClass: GlobalVariableServiceStub },
        { provide: TimebarService, useClass: TimebarServiceStub },
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FilterTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
