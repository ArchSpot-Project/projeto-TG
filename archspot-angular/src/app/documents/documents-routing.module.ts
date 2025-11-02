import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DocumentsComponent } from './documents.component';
import { DocumentViewComponent } from './document-view/document-view.component';

const routes: Routes = [
  { path: 'projects/:projectId/documents', component: DocumentsComponent },
  { path: 'projects/:projectId/documents/:id/view', component: DocumentViewComponent }
];  

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DocumentsRoutingModule { }