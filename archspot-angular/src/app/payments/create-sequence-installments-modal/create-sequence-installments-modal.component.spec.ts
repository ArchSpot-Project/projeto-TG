import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateSequenceInstallmentsModalComponent } from './create-sequence-installments-modal.component';

describe('CreateSequenceInstallmentsModalComponent', () => {
  let component: CreateSequenceInstallmentsModalComponent;
  let fixture: ComponentFixture<CreateSequenceInstallmentsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreateSequenceInstallmentsModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateSequenceInstallmentsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
