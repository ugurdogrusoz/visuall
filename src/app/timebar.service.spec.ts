import { TestBed } from '@angular/core/testing';

import { TimebarService } from './timebar.service';

describe('Timebar2Service', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TimebarService = TestBed.get(TimebarService);
    expect(service).toBeTruthy();
  });
});
