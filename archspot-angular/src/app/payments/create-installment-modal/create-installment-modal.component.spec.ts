import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateInstallmentModalComponent } from './create-installment-modal.component';

describe('CreateInstallmentModalComponent', () => {
  let component: CreateInstallmentModalComponent;
  let fixture: ComponentFixture<CreateInstallmentModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreateInstallmentModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateInstallmentModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
