import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CytoscapeService } from './cytoscape.service';
import { GlobalVariableService } from './global-variable.service';
import { Neo4jDb } from './db-service/neo4j-db.service';
import { TimebarService } from './timebar.service';

class GlobalVariableServiceStub { }
class DbServiceStub { }
class TimebarServiceStub { }

describe('CytoscapeService', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CytoscapeService,
        { provide: GlobalVariableService, useClass: GlobalVariableServiceStub },
        { provide: Neo4jDb, useClass: DbServiceStub },
        { provide: TimebarService, useClass: TimebarServiceStub },
      ],
      imports: [HttpClientTestingModule]
    })
  });

  it('should be created', () => {
    const service: CytoscapeService = TestBed.get(CytoscapeService);
    expect(service).toBeTruthy();
  });

  // it('should be able to call a function from the dependecy  ', () => {
  //   const service: CytoscapeService = TestBed.get(CytoscapeService);
  //   expect(service).toBeTruthy();
  // });
});
