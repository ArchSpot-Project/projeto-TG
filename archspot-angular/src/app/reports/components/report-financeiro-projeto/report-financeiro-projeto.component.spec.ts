import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportFinanceiroProjetoComponent } from './report-financeiro-projeto.component';

describe('ReportFinanceiroProjetoComponent', () => {
  let component: ReportFinanceiroProjetoComponent;
  let fixture: ComponentFixture<ReportFinanceiroProjetoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReportFinanceiroProjetoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportFinanceiroProjetoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
