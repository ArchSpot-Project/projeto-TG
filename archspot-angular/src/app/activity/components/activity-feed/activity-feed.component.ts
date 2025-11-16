import { Component, Input, OnInit } from '@angular/core';
import { Activity } from '../../../core/models/activity.model';
import { ActivityService } from '../../../core/services/activity.service';

@Component({
  selector: 'app-activity-feed',
  templateUrl: './activity-feed.component.html',
  styleUrls: ['./activity-feed.component.css']
})
export class ActivityFeedComponent implements OnInit {

  @Input() projectId!: number;
  activities: Activity[] = [];
  loading = true;

  constructor(private activityService: ActivityService) {}

  ngOnInit(): void {
    this.activityService.getByProject(this.projectId).subscribe({
      next: (res) => {
        this.activities = res;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
