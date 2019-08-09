import { TestBed } from '@angular/core/testing';

import { TimebarService } from './timebar.service';

describe('TimebarService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TimebarService = TestBed.get(TimebarService);
    expect(service).toBeTruthy();
  });

  it('getToolTippedData should output human readable nice strings', () => {
    const service: TimebarService = TestBed.get(TimebarService);
    let d1 = new Date().getTime();
    
    let r = service.getToolTippedData(d1, 'quarter', [1]);
    console.log('r = ', r);

  });
});
