import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalCadastroComponent } from './modal-cadastro/modal-cadastro.component';
import { FormsModule } from '@angular/forms';
import { ProjectStatusBarComponent } from './components/project-status-bar/project-status-bar.component';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';



@NgModule({
  declarations: [
    ModalCadastroComponent,
    ProjectStatusBarComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    NgxMaskDirective
  ],
  exports: [
    ProjectStatusBarComponent
  ],
  providers: [
    provideNgxMask()
  ]
})
export class SharedModule { }
