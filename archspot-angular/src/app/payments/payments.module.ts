import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutModule } from '../layout/layout.module';
import { PaymentsComponent } from './payments.component';
import { PaymentsRoutingModule } from './payments-routing.module';
import { EditInstallmentModalComponent } from './edit-installment-modal/edit-installment-modal.component';
import { CreateInstallmentModalComponent } from './create-installment-modal/create-installment-modal.component';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [PaymentsComponent, EditInstallmentModalComponent, CreateInstallmentModalComponent],
  imports: [
    CommonModule,
    PaymentsRoutingModule,
    LayoutModule,
    FormsModule,
    SharedModule
  ]
})
export class PaymentsModule {}
