import { TestBed } from '@angular/core/testing';

import { RuleParserService } from './rule-parser.service';

describe('RuleParserService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: RuleParserService = TestBed.get(RuleParserService);
    expect(service).toBeTruthy();
  });
});
