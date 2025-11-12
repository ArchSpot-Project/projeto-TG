import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmCreateNewProjectModalComponent } from './confirm-create-new-project.component';


describe('ConfirmCreateNewTemplateComponent', () => {
  let component: ConfirmCreateNewProjectModalComponent;
  let fixture: ComponentFixture<ConfirmCreateNewProjectModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConfirmCreateNewProjectModalComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ConfirmCreateNewProjectModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
