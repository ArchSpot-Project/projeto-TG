import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProfileRoutingModule } from './profile-routing.module';
import { ProfilePageComponent } from './pages/profile-page/profile-page.component';
import { LayoutModule } from '../layout/layout.module';
import { SharedModule } from '../shared/shared.module';
import { ChangePasswordModalComponent } from './change-password-modal/change-password-modal.component';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    ProfilePageComponent,
    ChangePasswordModalComponent
  ],
  imports: [
    CommonModule,
    ProfileRoutingModule,
    LayoutModule,
    SharedModule,
    FormsModule
  ]
})
export class ProfileModule { }
