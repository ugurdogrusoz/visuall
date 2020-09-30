import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { GlobalVariableService } from '../../visuall/global-variable.service';
import { TypesViewComponent } from './types-view.component';

class GlobalVariableServiceStub { }

describe('TypesViewComponent', () => {
  let component: TypesViewComponent;
  let fixture: ComponentFixture<TypesViewComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [TypesViewComponent],
      providers: [{ provide: GlobalVariableService, useClass: GlobalVariableServiceStub }]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TypesViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
