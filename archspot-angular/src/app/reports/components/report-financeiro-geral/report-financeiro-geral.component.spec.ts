import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportFinanceiroGeralComponent } from './report-financeiro-geral.component';

describe('ReportFinanceiroGeralComponent', () => {
  let component: ReportFinanceiroGeralComponent;
  let fixture: ComponentFixture<ReportFinanceiroGeralComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReportFinanceiroGeralComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportFinanceiroGeralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
