import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalCadastroComponent } from './modal-cadastro/modal-cadastro.component';
import { FormsModule } from '@angular/forms';
import { ProjectStatusBarComponent } from './components/project-status-bar/project-status-bar.component';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { ProjectCardComponent } from './project-card/project-card.component';
import { SectionTitleComponent } from './section-title/section-title.component';
import { TableComponent } from './table/table.component';
import { StatusTranslatePipe } from '../pipes/project-status.pipe';

@NgModule({
  declarations: [
    ModalCadastroComponent,
    ProjectStatusBarComponent,
    ProjectCardComponent,
    SectionTitleComponent,
    TableComponent,
    StatusTranslatePipe
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
    TableComponent,
    StatusTranslatePipe
  ],
  providers: [
    provideNgxMask()
  ]
})
export class SharedModule { }
