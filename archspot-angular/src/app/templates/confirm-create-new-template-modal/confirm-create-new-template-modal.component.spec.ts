import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmCreateNewTemplateModalComponent } from './confirm-create-new-template-modal.component';

describe('ConfirmCreateNewTemplateModalComponent', () => {
  let component: ConfirmCreateNewTemplateModalComponent;
  let fixture: ComponentFixture<ConfirmCreateNewTemplateModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConfirmCreateNewTemplateModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmCreateNewTemplateModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
