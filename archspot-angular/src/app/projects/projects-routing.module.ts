import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProjectsPageComponent } from './pages/projects-page/projects-page.component';
import { ProjectDetailsPageComponent } from './pages/project-details-page/project-details-page.component';

const routes: Routes = [
  { path: 'projects', component: ProjectsPageComponent },
  { path: 'projects/:id', component: ProjectDetailsPageComponent }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProjectsRoutingModule { }
