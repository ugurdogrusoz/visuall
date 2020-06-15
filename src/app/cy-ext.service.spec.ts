import { TestBed } from '@angular/core/testing';

import { CyExtService } from './cy-ext.service';

describe('CyExtService', () => {
  let service: CyExtService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CyExtService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
