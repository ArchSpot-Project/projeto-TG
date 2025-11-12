import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewPhaseTemplateModalComponent } from './new-phase-template-modal.component';

describe('NewPhaseTemplateModalComponent', () => {
  let component: NewPhaseTemplateModalComponent;
  let fixture: ComponentFixture<NewPhaseTemplateModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NewPhaseTemplateModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewPhaseTemplateModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
