import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EventsPageComponent } from './pages/events-page/events-page.component';

const routes: Routes = [
  { path: 'events', component: EventsPageComponent },
  { path: 'projects/:projectId/events', component: EventsPageComponent } 
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EventsRoutingModule { }