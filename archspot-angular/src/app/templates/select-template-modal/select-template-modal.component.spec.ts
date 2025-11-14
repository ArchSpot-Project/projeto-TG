import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectTemplateModalComponent } from './select-template-modal.component';

describe('SelectTemplateModalComponent', () => {
  let component: SelectTemplateModalComponent;
  let fixture: ComponentFixture<SelectTemplateModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SelectTemplateModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectTemplateModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
