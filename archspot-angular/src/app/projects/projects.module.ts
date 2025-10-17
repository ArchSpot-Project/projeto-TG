import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProjectsRoutingModule } from './projects-routing.module';
import { ProjectsPageComponent } from './pages/projects-page/projects-page.component';
import { ProjectDetailsPageComponent } from './pages/project-details-page/project-details-page.component';
import { LayoutModule } from "../layout/layout.module";
import { SharedModule } from '../shared/shared.module';
import { StatusTranslatePipe } from '../pipes/project-status.pipe';


@NgModule({
  declarations: [
    ProjectsPageComponent,
    ProjectDetailsPageComponent,
    StatusTranslatePipe
  ],
  imports: [
    CommonModule,
    ProjectsRoutingModule,
    LayoutModule,
    SharedModule
],
  exports: [
  ]
})
export class ProjectsModule { }
