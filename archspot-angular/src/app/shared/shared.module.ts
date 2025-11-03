import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalCadastroComponent } from './modal-cadastro/modal-cadastro.component';
import { FormsModule } from '@angular/forms';
import { ProjectStatusBarComponent } from './components/project-status-bar/project-status-bar.component';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { ProjectCardComponent } from './project-card/project-card.component';
import { SectionTitleComponent } from './section-title/section-title.component';
import { TableComponent } from './table/table.component';
import { StatusTranslatePipe } from '../core/pipes/project-status.pipe';
import { RoleTranslatePipe } from '../core/pipes/user-roles.pipes';
import { CreateProjectModalComponent } from '../projects/create-project-modal/create-project-modal.component';
import { AddUserModalComponent } from '../users-project/add-user-modal/add-user-modal.component';
import { PhaseStatusPipe } from '../core/pipes/phase-status.pipe';
import { PaymentMethodPipe } from '../core/pipes/payment-method.pipe';
import { PaymentStatusPipe } from '../core/pipes/payment-status.pipe';
import { DirectoryComponent } from './directory/directory.component';
import { DateDashPipe } from '../core/pipes/date.pipe';

@NgModule({
  declarations: [
    ModalCadastroComponent,
    ProjectStatusBarComponent,
    ProjectCardComponent,
    SectionTitleComponent,
    CreateProjectModalComponent,
    TableComponent,
    StatusTranslatePipe,
    ProjectStatusBarComponent,
    RoleTranslatePipe,
    PaymentMethodPipe,
    PaymentStatusPipe,
    PhaseStatusPipe,
    DateDashPipe,
    AddUserModalComponent,
    DirectoryComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    NgxMaskDirective
  ],
  exports: [
    ProjectStatusBarComponent,
    ProjectCardComponent,
    SectionTitleComponent,
    CreateProjectModalComponent,
    TableComponent,
    StatusTranslatePipe,
    PaymentMethodPipe,
    ProjectStatusBarComponent,
    PaymentStatusPipe,
    PhaseStatusPipe,
    DateDashPipe,
    RoleTranslatePipe,
    DirectoryComponent,
    AddUserModalComponent
  ],
  providers: [
    provideNgxMask()
  ]
})
export class SharedModule { }
