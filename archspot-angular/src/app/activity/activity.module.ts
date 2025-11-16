import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivityCardComponent } from './components/activity-card/activity-card.component';
import { ActivityFeedComponent } from './components/activity-feed/activity-feed.component';



@NgModule({
  declarations: [
    ActivityCardComponent,
    ActivityFeedComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    ActivityCardComponent,
    ActivityFeedComponent
  ]
})
export class ActivityModule { }
