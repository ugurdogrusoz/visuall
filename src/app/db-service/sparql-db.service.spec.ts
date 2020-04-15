import { TestBed } from '@angular/core/testing';

import { SparqlDbService } from './sparql-db.service';

describe('SparqlDbService', () => {
  let service: SparqlDbService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SparqlDbService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
