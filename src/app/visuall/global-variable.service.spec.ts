import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { GlobalVariableService } from './global-variable.service';

describe('GlobalVariableService', () => {
  beforeEach(() => TestBed.configureTestingModule({ imports: [HttpClientTestingModule] }));

  it('should be created', () => {
    const service: GlobalVariableService = TestBed.get(GlobalVariableService);
    expect(service).toBeTruthy();
  });
});
