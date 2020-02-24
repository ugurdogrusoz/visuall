import { TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';

import { ContextMenuService } from './context-menu.service';

describe('ContextMenuService', () => {
  beforeEach(() => TestBed.configureTestingModule({ imports: [HttpClientModule] }));

  it('should be created', () => {
    const service: ContextMenuService = TestBed.get(ContextMenuService);
    expect(service).toBeTruthy();
  });
});
