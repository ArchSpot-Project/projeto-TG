import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutModule } from '../layout/layout.module';
import { SharedModule } from '../shared/shared.module';
import { FormsModule } from '@angular/forms';
import { PhotosComponent } from './photos/photos.component';
import { AlbunsComponent } from './albuns.component';
import { AlbunsRoutingModule } from './albuns-routing.module';

@NgModule({
  declarations: [AlbunsComponent, PhotosComponent],
  imports: [
    CommonModule,
    AlbunsRoutingModule,
    LayoutModule,
    SharedModule,
    FormsModule
  ]
})
export class AlbunsModule {}
