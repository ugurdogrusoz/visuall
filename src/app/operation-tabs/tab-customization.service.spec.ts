import { TestBed } from '@angular/core/testing';

import { TabCustomizationService } from './tab-customization.service';

describe('TabCustomizationService', () => {
  let service: TabCustomizationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TabCustomizationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
