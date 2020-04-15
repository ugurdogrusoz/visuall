import { TestBed } from '@angular/core/testing';

import { DataContentService } from './data-content.service';

describe('DataContentService', () => {
  let service: DataContentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DataContentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
