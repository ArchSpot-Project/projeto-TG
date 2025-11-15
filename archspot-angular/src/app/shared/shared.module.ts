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
import { DirectoryNodeComponent } from './directory/directory-node/directory-node.component';
import { SafeUrlPipe } from '../core/pipes/safe-url.pipe';
import { ToastContainerComponent } from './toast-container/toast-container.component';
import { NgbToastModule } from '@ng-bootstrap/ng-bootstrap';
import { NewPhaseTemplateModalComponent } from '../templates/new-phase-template-modal/new-phase-template-modal.component';
import { NewProjectTemplateModalComponent } from '../templates/new-project-template-modal/new-project-template-modal.component';
import { SelectTemplateModalComponent } from '../templates/select-template-modal/select-template-modal.component';
import { ConfirmCreateNewProjectModalComponent } from '../templates/confirm-create-new-project/confirm-create-new-project.component';
import { ConfirmCreateNewTemplateModalComponent } from '../templates/confirm-create-new-template-modal/confirm-create-new-template-modal.component';
import { DocVersioningModalComponent } from './doc-versioning-modal/doc-versioning-modal.component';
import { FinancialStatusPipe } from '../core/pipes/financial-status.pipe';
import { PercentPipe } from '../core/pipes/percent.pipe';

@NgModule({
  declarations: [
    ModalCadastroComponent,
    ProjectStatusBarComponent,
    ProjectCardComponent,
    SectionTitleComponent,
    CreateProjectModalComponent,
    TableComponent,
    StatusTranslatePipe,
    SafeUrlPipe,
    ConfirmCreateNewProjectModalComponent,
    NewPhaseTemplateModalComponent,
    NewProjectTemplateModalComponent,
    SelectTemplateModalComponent,
    ConfirmCreateNewTemplateModalComponent,
    ProjectStatusBarComponent,
    RoleTranslatePipe,
    PaymentMethodPipe,
    PaymentStatusPipe,
    PhaseStatusPipe,
    DateDashPipe,
    AddUserModalComponent,
    DirectoryComponent,
    DirectoryNodeComponent,
    ToastContainerComponent,
    DocVersioningModalComponent,
    FinancialStatusPipe,
    PercentPipe
  ],
  imports: [
    CommonModule,
    FormsModule,
    NgxMaskDirective,
    NgbToastModule,
  ],
  exports: [
    ProjectStatusBarComponent,
    ProjectCardComponent,
    SectionTitleComponent,
    CreateProjectModalComponent,
    TableComponent,
    ToastContainerComponent,
    StatusTranslatePipe,
    SafeUrlPipe,
    ConfirmCreateNewProjectModalComponent,
    NewPhaseTemplateModalComponent,
    NewProjectTemplateModalComponent,
    SelectTemplateModalComponent,
    ConfirmCreateNewTemplateModalComponent,
    PaymentMethodPipe,
    ProjectStatusBarComponent,
    PaymentStatusPipe,
    PhaseStatusPipe,
    DateDashPipe,
    RoleTranslatePipe,
    DirectoryComponent,
    AddUserModalComponent,
    FinancialStatusPipe,
    PercentPipe
  ],
  providers: [
    provideNgxMask()
  ]
})
export class SharedModule { }
