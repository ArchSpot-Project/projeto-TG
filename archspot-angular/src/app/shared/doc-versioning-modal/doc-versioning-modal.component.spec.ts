import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocVersioningModalComponent } from './doc-versioning-modal.component';

describe('DocVersioningModalComponent', () => {
  let component: DocVersioningModalComponent;
  let fixture: ComponentFixture<DocVersioningModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DocVersioningModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocVersioningModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
