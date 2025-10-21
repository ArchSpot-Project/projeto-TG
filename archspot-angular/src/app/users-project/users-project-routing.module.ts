import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UsersProjectPageComponent } from './pages/users-project-page/users-project-page.component';

const routes: Routes = [
  {path: 'projects/:id/users-project', component: UsersProjectPageComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsersProjectRoutingModule { }
