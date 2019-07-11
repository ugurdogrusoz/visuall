import { TestBed } from '@angular/core/testing';

import { NavbarCustomizationService } from './navbar-customization.service';

describe('NavbarCustomizationService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: NavbarCustomizationService = TestBed.get(NavbarCustomizationService);
    expect(service).toBeTruthy();
  });
});
