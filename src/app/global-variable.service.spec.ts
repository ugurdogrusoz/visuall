import { TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';

import { GlobalVariableService } from './global-variable.service';

describe('GlobalVariableService', () => {
  beforeEach(() => TestBed.configureTestingModule({ imports: [HttpClientModule] }));

  it('should be created', () => {
    const service: GlobalVariableService = TestBed.get(GlobalVariableService);
    expect(service).toBeTruthy();
  });
});
