import { TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';

import { NavbarCustomizationService } from './navbar-customization.service';

describe('NavbarCustomizationService', () => {
  beforeEach(() => TestBed.configureTestingModule({ imports: [HttpClientModule] }));

  it('should be created', () => {
    const service: NavbarCustomizationService = TestBed.get(NavbarCustomizationService);
    expect(service).toBeTruthy();
  });
});
