import { TestBed } from '@angular/core/testing';
import { GlobalVariableService } from './global-variable.service';
import { HttpClient } from '@angular/common/http';
import { DbService } from './db.service';

class GlobalVariableServiceStub { }
class HttpClientStub { }

describe('DbService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DbService,
        { provide: GlobalVariableService, useClass: GlobalVariableServiceStub },
        { provide: HttpClient, useClass: HttpClientStub },
      ]
    })
  });

  it('should be created', () => {
    const service: DbService = TestBed.get(DbService);
    expect(service).toBeTruthy();
  });
});
