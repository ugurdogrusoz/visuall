import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { GlobalVariableService } from '../../global-variable.service';
import { ObjectTabComponent } from './object-tab.component';
import cytoscape from 'cytoscape';

class GlobalVariableServiceStub { cy = cytoscape(); }


describe('ObjectTabComponent', () => {
  let component: ObjectTabComponent;
  let fixture: ComponentFixture<ObjectTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ObjectTabComponent],
      providers: [
        { provide: GlobalVariableService, useClass: GlobalVariableServiceStub },
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ObjectTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
