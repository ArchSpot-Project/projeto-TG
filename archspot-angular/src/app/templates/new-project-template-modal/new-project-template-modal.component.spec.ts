import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewProjectTemplateModalComponent } from './new-project-template-modal.component';

describe('NewProjectTemplateModalComponent', () => {
  let component: NewProjectTemplateModalComponent;
  let fixture: ComponentFixture<NewProjectTemplateModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NewProjectTemplateModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewProjectTemplateModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
