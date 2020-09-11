import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { URLLoadService } from './load-from-url.service';
import { RouterTestingModule } from '@angular/router/testing';

class ActivatedRouteStub { }

describe('LoadFromUrl', () => {
  let service: URLLoadService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
    });
    service = TestBed.inject(URLLoadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
