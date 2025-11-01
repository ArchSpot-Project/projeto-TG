import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportsRoutingModule } from './reports-routing.module';
import { ReportsPageComponent } from './pages/reports-page/reports-page.component';
import { LayoutModule } from '../layout/layout.module';
import { ReportCronogramaGeralComponent } from './components/report-cronograma-geral/report-cronograma-geral.component';
import { ReportCronogramaProjetoComponent } from './components/report-cronograma-projeto/report-cronograma-projeto.component';
import { ReportFinanceiroGeralComponent } from './components/report-financeiro-geral/report-financeiro-geral.component';
import { ReportFinanceiroProjetoComponent } from './components/report-financeiro-projeto/report-financeiro-projeto.component';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';


@NgModule({
  declarations: [
    ReportsPageComponent,
    ReportCronogramaGeralComponent,
    ReportCronogramaProjetoComponent,
    ReportFinanceiroGeralComponent,
    ReportFinanceiroProjetoComponent
  ],
  imports: [
    CommonModule,
    ReportsRoutingModule,
    LayoutModule,
    NgbNavModule,
    FormsModule,
    SharedModule
  ]
})
export class ReportsModule { }
