import { Component, OnInit } from '@angular/core';
import { User } from '../../../core/models/user.model';
import { UserService } from '../../../core/services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css'
})
export class HomePageComponent {

  users: User[] = [];

  constructor(private router: Router) {};

  goToProjects(projectId: number): void {
    this.router.navigate(['/projects', projectId]);
  }
}
