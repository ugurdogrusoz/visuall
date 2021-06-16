import { TestBed } from '@angular/core/testing';

import { CyStyleCustomizationService } from './cy-style-customization.service';

describe('CyStyleCustomizationService', () => {
  let service: CyStyleCustomizationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CyStyleCustomizationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
