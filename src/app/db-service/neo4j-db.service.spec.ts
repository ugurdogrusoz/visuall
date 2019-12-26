import { TestBed } from '@angular/core/testing';
import { GlobalVariableService } from '../global-variable.service';
import { HttpClient } from '@angular/common/http';
import { Neo4jDb } from './neo4j-db.service';

class GlobalVariableServiceStub { }
class HttpClientStub { }

describe('DbService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [Neo4jDb,
        { provide: GlobalVariableService, useClass: GlobalVariableServiceStub },
        { provide: HttpClient, useClass: HttpClientStub },
      ]
    })
  });

  it('should be created', () => {
    const service: Neo4jDb = TestBed.get(Neo4jDb);
    expect(service).toBeTruthy();
  });
});
