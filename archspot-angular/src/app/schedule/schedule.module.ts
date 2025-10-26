import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutModule } from '../layout/layout.module';
import { ScheduleComponent } from './schedule.component';
import { ScheduleRoutingModule } from './schedule-routing.module';
import { SharedModule } from '../shared/shared.module';
import { CreatePhaseModalComponent } from './create-phase-modal/create-phase-modal.component';
import { EditPhaseModalComponent } from './edit-phase-modal/edit-phase-modal.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [ScheduleComponent, CreatePhaseModalComponent, EditPhaseModalComponent],
  imports: [
    CommonModule,
    ScheduleRoutingModule,
    LayoutModule,
    SharedModule,
    FormsModule
  ]
})
export class ScheduleModule {}
