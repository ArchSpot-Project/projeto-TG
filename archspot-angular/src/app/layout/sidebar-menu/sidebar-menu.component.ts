import { Component } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar-menu',
  templateUrl: './sidebar-menu.component.html',
  styleUrl: './sidebar-menu.component.css'
})
export class SidebarMenuComponent {

  constructor(private authService: AuthService, private router: Router) { }

  goToProjects(projectId?: number): void {
    if (projectId !== undefined) {
      this.router.navigate(['/projects', projectId]);
    } else {
      this.router.navigate(['/projects']);
    }
  }
  goToEvents() {
    this.router.navigate(['/events']);
  }
  goTorReports() {
    this.router.navigate(['/reports']);
  }
  
  goToProfile() {
    this.router.navigate(['/profile']);
  }
  goToMaintenance() {
    this.router.navigate(['/maintenance']);
  }
  goToSettings() {
    this.router.navigate(['/settings']);
  }
  
  goToHelp() {
    this.router.navigate(['/help']);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }

}
