import { TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';

import { DbAdapterService } from './db-adapter.service';

describe('DbAdapterService', () => {
  beforeEach(() => TestBed.configureTestingModule({ imports: [HttpClientModule] }));

  it('should be created', () => {
    const service: DbAdapterService = TestBed.get(DbAdapterService);
    expect(service).toBeTruthy();
  });
});
