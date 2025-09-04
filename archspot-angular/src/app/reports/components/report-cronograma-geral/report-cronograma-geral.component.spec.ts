import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportCronogramaGeralComponent } from './report-cronograma-geral.component';

describe('ReportCronogramaGeralComponent', () => {
  let component: ReportCronogramaGeralComponent;
  let fixture: ComponentFixture<ReportCronogramaGeralComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReportCronogramaGeralComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportCronogramaGeralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
