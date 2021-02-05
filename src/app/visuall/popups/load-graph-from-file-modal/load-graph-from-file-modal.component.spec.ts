import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadGraphFromFileModalComponent } from './load-graph-from-file-modal.component';

describe('LoadGraphFromFileModalComponent', () => {
  let component: LoadGraphFromFileModalComponent;
  let fixture: ComponentFixture<LoadGraphFromFileModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LoadGraphFromFileModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoadGraphFromFileModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
