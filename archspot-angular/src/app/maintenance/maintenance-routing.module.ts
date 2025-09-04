import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MaintenancePageComponent } from './pages/maintenance-page/maintenance-page.component';

const routes: Routes = [
  {path: 'maintenance', component: MaintenancePageComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MaintenanceRoutingModule { }
