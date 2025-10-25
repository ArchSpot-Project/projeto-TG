import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatePhaseModalComponent } from './create-phase-modal.component';

describe('CreatePhaseModalComponent', () => {
  let component: CreatePhaseModalComponent;
  let fixture: ComponentFixture<CreatePhaseModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreatePhaseModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreatePhaseModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
