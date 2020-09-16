import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { GlobalVariableService } from '../../../global-variable.service';
import { CytoscapeService } from '../../../cytoscape.service';
import { GroupTabComponent } from './group-tab.component';
import { FormsModule } from '@angular/forms';

class CytoscapeServiceStub { }
class GlobalVariableServiceStub { }

describe('GroupTabComponent', () => {
  let component: GroupTabComponent;
  let fixture: ComponentFixture<GroupTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupTabComponent ],
      imports: [FormsModule],
      providers: [
        { provide: CytoscapeService, useClass: CytoscapeServiceStub },
        { provide: GlobalVariableService, useClass: GlobalVariableServiceStub },
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
