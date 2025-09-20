import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutModule } from '../layout/layout.module';
import { FinancialComponent } from './financial.component';
import { FinancialRoutingModule } from './financial-routing.module';

@NgModule({
  declarations: [FinancialComponent],
  imports: [
    CommonModule,
    FinancialRoutingModule,
    LayoutModule
  ]
})
export class FinancialModule {}
