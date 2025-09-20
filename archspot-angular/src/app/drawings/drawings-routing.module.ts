import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DrawingsComponent } from './drawings.component';

const routes: Routes = [
  { path: 'projects/:projectId/drawings', component: DrawingsComponent } 
];  

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DrawingsRoutingModule { }