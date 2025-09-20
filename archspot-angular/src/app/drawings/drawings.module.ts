import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DrawingsComponent } from './drawings.component';
import { DrawingsRoutingModule } from './drawings-routing.module';
import { LayoutModule } from '../layout/layout.module';

@NgModule({
  declarations: [DrawingsComponent],
  imports: [
    CommonModule,
    DrawingsRoutingModule,
    LayoutModule
  ]
})
export class DrawingsModule {}
