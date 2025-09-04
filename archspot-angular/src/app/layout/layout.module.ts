import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './navbar/navbar.component';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { FooterComponent } from './footer/footer.component';
import { RouterLinkActive, RouterModule } from '@angular/router';
import { SidebarMenuComponent } from './sidebar-menu/sidebar-menu.component';
import { PageLayoutComponent } from './page-layout/page-layout.component';
import { PublicPageLayoutComponent } from './public-page-layout/public-page-layout.component';
import { SharedModule } from '../shared/shared.module';



@NgModule({
  declarations: [
    NavbarComponent,
    FooterComponent,
    SidebarMenuComponent,
    PageLayoutComponent,
    PublicPageLayoutComponent
  ],
  imports: [
    CommonModule,
    NgbDropdownModule,
    RouterModule,
    SharedModule
  ],
  exports: [
    NavbarComponent,
    FooterComponent,
    SidebarMenuComponent,
    PageLayoutComponent,
    PublicPageLayoutComponent
  ]
})
export class LayoutModule { }