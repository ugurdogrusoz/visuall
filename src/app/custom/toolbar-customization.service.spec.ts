import { TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';

import { ToolbarCustomizationService } from './toolbar-customization.service';

describe('ToolbarCustomizationService', () => {
  beforeEach(() => TestBed.configureTestingModule({ imports: [HttpClientModule] }));

  it('should be created', () => {
    const service: ToolbarCustomizationService = TestBed.get(ToolbarCustomizationService);
    expect(service).toBeTruthy();
  });
});
