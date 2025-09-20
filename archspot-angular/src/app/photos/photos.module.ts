import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutModule } from '../layout/layout.module';
import { PhotosComponent } from './photos.component';
import { PhotosRoutingModule } from './photos-routing.module';

@NgModule({
  declarations: [PhotosComponent],
  imports: [
    CommonModule,
    PhotosRoutingModule,
    LayoutModule
  ]
})
export class PhotosModule {}
