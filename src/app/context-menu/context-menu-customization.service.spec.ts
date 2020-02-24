import { TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';

import { ContextMenuCustomizationService } from './context-menu-customization.service';

describe('ContextMenuCustomizationService', () => {
  beforeEach(() => TestBed.configureTestingModule({ imports: [HttpClientModule] }));

  it('should be created', () => {
    const service: ContextMenuCustomizationService = TestBed.get(ContextMenuCustomizationService);
    expect(service).toBeTruthy();
  });
});
