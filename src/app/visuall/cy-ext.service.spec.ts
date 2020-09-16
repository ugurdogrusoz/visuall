import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CyExtService } from './cy-ext.service';

describe('CyExtService', () => {
  let service: CyExtService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(CyExtService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
