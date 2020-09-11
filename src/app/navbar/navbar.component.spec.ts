import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DbAdapterService } from '../db-service/db-adapter.service';
import { GlobalVariableService } from '../global-variable.service';
import { NavbarCustomizationService } from './navbar-customization.service';
import { UserProfileService } from '../user-profile.service';
import { CytoscapeService } from '../cytoscape.service';
import { URLLoadService } from '../load-from-url.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { NavbarComponent } from './navbar.component';
import { DebugElement } from '@angular/core';

class CytoscapeServiceStub { }
class DbServiceStub { }
class GlobalVariableServiceStub { }
class NavbarCustomizationServiceStub { }
class UserProfileServiceStub { }
class URLLoadServiceStub { }

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let debugElem: DebugElement;
  let nativeElem: any;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [NavbarComponent],
      providers: [
        { provide: CytoscapeService, useClass: CytoscapeServiceStub },
        { provide: DbAdapterService, useClass: DbServiceStub },
        { provide: GlobalVariableService, useClass: GlobalVariableServiceStub },
        { provide: NavbarCustomizationService, useClass: NavbarCustomizationServiceStub },
        { provide: UserProfileService, useClass: UserProfileServiceStub },
        { provide: URLLoadService, useClass: URLLoadServiceStub },
        NgbModal
      ],
      imports: []
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    debugElem = fixture.debugElement;
    nativeElem = debugElem.nativeElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load a file', async(() => {
    spyOn(component, 'triggerAct');

    const btn = nativeElem.querySelector('#nbi00');
    expect(btn.textContent).toEqual('Load...');
    btn.click();

    fixture.whenStable().then(() => {
      expect(component.triggerAct).toHaveBeenCalled();
    });
  }));

  it('should save as JSON', async(() => {
    spyOn(component, 'triggerAct');

    const btn = nativeElem.querySelector('#nbi01');
    expect(btn.textContent).toEqual('Save as JSON');
    btn.click();

    fixture.whenStable().then(() => {
      expect(component.triggerAct).toHaveBeenCalled();
    });
  }));

  it('should save as PNG', async(() => {
    spyOn(component, 'triggerAct');

    const btn = nativeElem.querySelector('#nbi02');
    expect(btn.textContent).toEqual('Save as PNG...');
    btn.click();

    fixture.whenStable().then(() => {
      expect(component.triggerAct).toHaveBeenCalled();
    });
  }));

  it('should Delete Selected', async(() => {
    spyOn(component, 'triggerAct');

    const btn = nativeElem.querySelector('#nbi10');
    expect(btn.textContent).toEqual('Delete Selected');
    btn.click();

    fixture.whenStable().then(() => {
      expect(component.triggerAct).toHaveBeenCalled();
    });
  }));

  it('should Hide Selected', async(() => {
    spyOn(component, 'triggerAct');

    const btn = nativeElem.querySelector('#nbi20');
    expect(btn.textContent).toEqual('Hide Selected');
    btn.click();

    fixture.whenStable().then(() => {
      expect(component.triggerAct).toHaveBeenCalled();
    });
  }));

  it('should Show All', async(() => {
    spyOn(component, 'triggerAct');

    const btn = nativeElem.querySelector('#nbi21');
    expect(btn.textContent).toEqual('Show All');
    btn.click();

    fixture.whenStable().then(() => {
      expect(component.triggerAct).toHaveBeenCalled();
    });
  }));

  it('should highlight Search...', async(() => {
    spyOn(component, 'triggerAct');

    const btn = nativeElem.querySelector('#nbi30');
    expect(btn.textContent).toEqual('Search...');
    btn.click();

    fixture.whenStable().then(() => {
      expect(component.triggerAct).toHaveBeenCalled();
    });
  }));

  it('should hightlight Selected', async(() => {
    spyOn(component, 'triggerAct');

    const btn = nativeElem.querySelector('#nbi31');
    expect(btn.textContent).toEqual('Selected');
    btn.click();

    fixture.whenStable().then(() => {
      expect(component.triggerAct).toHaveBeenCalled();
    });
  }));

  it('should hightlight Neighbors of Selected', async(() => {
    spyOn(component, 'triggerAct');

    const btn = nativeElem.querySelector('#nbi32');
    expect(btn.textContent).toEqual('Neighbors of Selected');
    btn.click();

    fixture.whenStable().then(() => {
      expect(component.triggerAct).toHaveBeenCalled();
    });
  }));

  it('should hightlight Remove Highlights', async(() => {
    spyOn(component, 'triggerAct');

    const btn = nativeElem.querySelector('#nbi33');
    expect(btn.textContent).toEqual('Remove Highlights');
    btn.click();

    fixture.whenStable().then(() => {
      expect(component.triggerAct).toHaveBeenCalled();
    });
  }));

  it('should Perform Layout', async(() => {
    spyOn(component, 'triggerAct');

    const btn = nativeElem.querySelector('#nbi40');
    expect(btn.textContent).toEqual('Perform Layout');
    btn.click();

    fixture.whenStable().then(() => {
      expect(component.triggerAct).toHaveBeenCalled();
    });
  }));

  it('should Recalculate Layout', async(() => {
    spyOn(component, 'triggerAct');

    const btn = nativeElem.querySelector('#nbi41');
    expect(btn.textContent).toEqual('Recalculate Layout');
    btn.click();

    fixture.whenStable().then(() => {
      expect(component.triggerAct).toHaveBeenCalled();
    });
  }));

  it('should Quick Help', async(() => {
    spyOn(component, 'triggerAct');

    const btn = nativeElem.querySelector('#nbi50');
    expect(btn.textContent).toEqual('Quick Help');
    btn.click();

    fixture.whenStable().then(() => {
      expect(component.triggerAct).toHaveBeenCalled();
    });
  }));

  it('should About', async(() => {
    spyOn(component, 'triggerAct');

    const btn = nativeElem.querySelector('#nbi51');
    expect(btn.textContent).toEqual('About');
    btn.click();

    fixture.whenStable().then(() => {
      expect(component.triggerAct).toHaveBeenCalled();
    });
  }));

  it('should Sample Data', async(() => {
    spyOn(component, 'triggerAct');

    const btn = nativeElem.querySelector('#nbi60');
    expect(btn.textContent).toEqual('Sample Data');
    btn.click();

    fixture.whenStable().then(() => {
      expect(component.triggerAct).toHaveBeenCalled();
    });
  }));

  it('should All Data', async(() => {
    spyOn(component, 'triggerAct');

    const btn = nativeElem.querySelector('#nbi61');
    expect(btn.textContent).toEqual('All Data');
    btn.click();

    fixture.whenStable().then(() => {
      expect(component.triggerAct).toHaveBeenCalled();
    });
  }));

  it('should Clear Data', async(() => {
    spyOn(component, 'triggerAct');

    const btn = nativeElem.querySelector('#nbi62');
    expect(btn.textContent).toEqual('Clear Data');
    btn.click();

    fixture.whenStable().then(() => {
      expect(component.triggerAct).toHaveBeenCalled();
    });
  }));

});
