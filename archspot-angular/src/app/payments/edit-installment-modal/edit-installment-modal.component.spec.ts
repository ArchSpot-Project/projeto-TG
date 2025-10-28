import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditInstallmentModalComponent } from './edit-installment-modal.component';

describe('EditInstallmentModalComponent', () => {
  let component: EditInstallmentModalComponent;
  let fixture: ComponentFixture<EditInstallmentModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditInstallmentModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditInstallmentModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
