import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivityCardComponent } from './components/activity-card/activity-card.component';
import { ActivityFeedComponent } from './components/activity-feed/activity-feed.component';
import { RoleTranslatePipe } from '../core/pipes/user-roles.pipes';
import { SharedModule } from '../shared/shared.module';



@NgModule({
  declarations: [
    ActivityCardComponent,
    ActivityFeedComponent
  ],
  imports: [
    CommonModule,
    SharedModule
  ],
  exports: [
    ActivityCardComponent,
    ActivityFeedComponent
  ]
})
export class ActivityModule { }
