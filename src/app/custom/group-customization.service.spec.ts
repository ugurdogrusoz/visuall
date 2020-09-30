import { TestBed } from '@angular/core/testing';

import { GroupCustomizationService } from './group-customization.service';

describe('GroupCustomizationService', () => {
  let service: GroupCustomizationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GroupCustomizationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
