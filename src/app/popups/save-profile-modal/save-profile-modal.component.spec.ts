import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SaveProfileModalComponent } from './save-profile-modal.component';

describe('SaveProfileModalComponent', () => {
  let component: SaveProfileModalComponent;
  let fixture: ComponentFixture<SaveProfileModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SaveProfileModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SaveProfileModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
