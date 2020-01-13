import { TestBed } from '@angular/core/testing';

import { Timebar2Service } from './timebar2.service';

describe('Timebar2Service', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: Timebar2Service = TestBed.get(Timebar2Service);
    expect(service).toBeTruthy();
  });
});
