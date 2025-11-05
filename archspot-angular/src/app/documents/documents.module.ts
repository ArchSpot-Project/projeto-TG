import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutModule } from '../layout/layout.module';
import { DocumentsRoutingModule } from './documents-routing.module';
import { DocumentsComponent } from './documents.component';
import { SharedModule } from '../shared/shared.module';
import { FormsModule } from '@angular/forms';
import { DocumentViewComponent } from './document-view/document-view.component';

@NgModule({
  declarations: [DocumentsComponent, DocumentViewComponent],
  imports: [
    CommonModule,
    DocumentsRoutingModule,
    LayoutModule,
    SharedModule,
    FormsModule
  ]
})
export class DocumentsModule {}
