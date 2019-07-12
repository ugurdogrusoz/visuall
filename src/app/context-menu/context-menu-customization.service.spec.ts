import { TestBed } from '@angular/core/testing';

import { ContextMenuCustomizationService } from './context-menu-customization.service';

describe('ContextMenuCustomizationService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ContextMenuCustomizationService = TestBed.get(ContextMenuCustomizationService);
    expect(service).toBeTruthy();
  });
});
