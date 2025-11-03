import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AlbunsComponent } from './albuns.component';
import { PhotosComponent } from './photos/photos.component';

const routes: Routes = [
  { path: 'projects/:id/albuns', component: AlbunsComponent },
  { path: 'projects/:id/albuns/:albumId', component: PhotosComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AlbunsRoutingModule { }
