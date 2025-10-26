import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditPhaseModalComponent } from './edit-phase-modal.component';

describe('EditPhaseModalComponent', () => {
  let component: EditPhaseModalComponent;
  let fixture: ComponentFixture<EditPhaseModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditPhaseModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditPhaseModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
