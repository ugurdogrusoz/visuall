import { TestBed } from '@angular/core/testing';

import { MarqueeZoomService } from './marquee-zoom.service';

describe('MarqueeZoomService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MarqueeZoomService = TestBed.get(MarqueeZoomService);
    expect(service).toBeTruthy();
  });
});
