import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProjectsRoutingModule } from './projects-routing.module';
import { ProjectsPageComponent } from './pages/projects-page/projects-page.component';
import { ProjectDetailsPageComponent } from './pages/project-details-page/project-details-page.component';
import { LayoutModule } from "../layout/layout.module";


@NgModule({
  declarations: [
    ProjectsPageComponent,
    ProjectDetailsPageComponent,
  ],
  imports: [
    CommonModule,
    ProjectsRoutingModule,
    LayoutModule
],
  exports: [
  ]
})
export class ProjectsModule { }
