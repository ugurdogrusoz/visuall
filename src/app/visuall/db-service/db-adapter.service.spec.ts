import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DbAdapterService } from './db-adapter.service';

describe('DbAdapterService', () => {
  beforeEach(() => TestBed.configureTestingModule({ imports: [HttpClientTestingModule] }));

  it('should be created', () => {
    const service: DbAdapterService = TestBed.get(DbAdapterService);
    expect(service).toBeTruthy();
  });
});
