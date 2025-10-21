import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersProjectRoutingModule } from './users-project-routing.module';
import { UsersProjectPageComponent } from './pages/users-project-page/users-project-page.component';
import { FormsModule } from '@angular/forms';
import { LayoutModule } from '../layout/layout.module';
import { SharedModule } from '../shared/shared.module';
import { AddUserModalComponent } from './add-user-modal/add-user-modal.component';


@NgModule({
  declarations: [
    UsersProjectPageComponent,
    AddUserModalComponent
  ],
  imports: [
    CommonModule,
    UsersProjectRoutingModule,
    FormsModule,
    LayoutModule,
    SharedModule
  ]
})
export class UsersProjectModule { }
