import { TestBed } from '@angular/core/testing';

import { DbAdapterService } from './db-adapter.service';

describe('DbAdapterService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DbAdapterService = TestBed.get(DbAdapterService);
    expect(service).toBeTruthy();
  });
});
