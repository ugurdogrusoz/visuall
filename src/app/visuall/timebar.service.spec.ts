import { TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';

import { TimebarService } from './timebar.service';

describe('TimebarService', () => {
  beforeEach(() => TestBed.configureTestingModule({ imports: [HttpClientModule] }));

  it('should be created', () => {
    const service: TimebarService = TestBed.get(TimebarService);
    expect(service).toBeTruthy();
  });
});
