import { TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';

import { MarqueeZoomService } from './marquee-zoom.service';

describe('MarqueeZoomService', () => {
  beforeEach(() => TestBed.configureTestingModule({ imports: [HttpClientModule] }));

  it('should be created', () => {
    const service: MarqueeZoomService = TestBed.get(MarqueeZoomService);
    expect(service).toBeTruthy();
  });
});
