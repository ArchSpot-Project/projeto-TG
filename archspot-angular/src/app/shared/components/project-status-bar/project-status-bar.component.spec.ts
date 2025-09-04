import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectStatusBarComponent } from './project-status-bar.component';

describe('ProjectStatusBarComponent', () => {
  let component: ProjectStatusBarComponent;
  let fixture: ComponentFixture<ProjectStatusBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProjectStatusBarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectStatusBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
