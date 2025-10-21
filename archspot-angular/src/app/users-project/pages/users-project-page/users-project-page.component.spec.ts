import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersProjectPageComponent } from './users-project-page.component';

describe('MaintenancePageComponent', () => {
  let component: UsersProjectPageComponent;
  let fixture: ComponentFixture<UsersProjectPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UsersProjectPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsersProjectPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
