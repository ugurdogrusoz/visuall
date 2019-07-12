import { TestBed } from '@angular/core/testing';

import { ToolbarCustomizationService } from './toolbar-customization.service';

describe('ToolbarCustomizationService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ToolbarCustomizationService = TestBed.get(ToolbarCustomizationService);
    expect(service).toBeTruthy();
  });
});
