import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportCronogramaProjetoComponent } from './report-cronograma-projeto.component';

describe('ReportCronogramaProjetoComponent', () => {
  let component: ReportCronogramaProjetoComponent;
  let fixture: ComponentFixture<ReportCronogramaProjetoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReportCronogramaProjetoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportCronogramaProjetoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
