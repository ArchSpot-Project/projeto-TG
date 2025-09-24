import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

interface Project {
  id: number;
  name: string;
}

@Component({
  selector: 'app-sidebar-menu',
  templateUrl: './sidebar-menu.component.html',
  styleUrls: ['./sidebar-menu.component.css']
})
export class SidebarMenuComponent implements OnInit {

  isProjectsMenuOpen: boolean = true;
  projects: Project[] = [
    { id: 1, name: 'Projeto 1' },
    { id: 2, name: 'Projeto 2' },
  ];
  activeProject: Project | null = null;

  //listas de itens do menu para simplificar o HTML
  projectMenuItems = [
    { key: 'drawings', icon: 'assets/img/icons/10-desenhos.png', label: 'Desenhos'},
    { key: 'documents', icon: 'assets/img/icons/07-documentos.png', label: 'Documentos'},
    { key: 'financial', icon: 'assets/img/icons/13-financeiro.png', label: 'Financeiro'},
    { key: 'photos', icon: 'assets/img/icons/11-fotos.png', label: 'Fotos'},
    { key: 'schedule', icon: 'assets/img/icons/09-cronograma2.png', label: 'Cronograma'},
    { key: 'events', icon: 'assets/img/icons/calendar2-event.svg', label: 'Eventos'},
  ];
  
  generalMenuItems = [
    { icon: 'assets/img/icons/calendar2-event.svg', label: 'Eventos', action: () => this.goToEvents() },
    { icon: 'assets/img/icons/file-richtext.svg', label: 'Relatórios', action: () => this.goToReports() }
  ];

  profileMenuItems = [
    { icon: 'assets/img/icons/04-perfil.png', label: 'Perfil', action: () => this.goToProfile() },
    { icon: 'assets/img/icons/person-add.svg', label: 'Cadastros', action: () => this.goToMaintenance() },
    { icon: 'assets/img/icons/gear.svg', label: 'Configurações', action: () => this.goToMaintenance() }
  ];

  helpMenuItems = [
    { icon: 'assets/img/icons/question-circle.svg', label: 'Ajuda', action: () => this.goToMaintenance() },
    { icon: 'assets/img/icons/box-arrow-right.svg', label: 'Sair', action: () => this.logout() }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.checkActiveProject();
    });
    this.checkActiveProject();
  }

  //verifica se a URL atual corresponde a um projeto específico
  checkActiveProject(): void {
    const urlSegments = this.router.url.split('/');
    const projectIdString = urlSegments[2];

    if (urlSegments[1] === 'projects' && projectIdString) {
      const projectId = parseInt(projectIdString, 10);
      this.activeProject = { id: projectId, name: `Projeto ${projectId}` };
      this.isProjectsMenuOpen = false;
    } else {
      this.activeProject = null;
      this.isProjectsMenuOpen = true;
    }
  }

  toggleProjectsMenu(): void {
    this.isProjectsMenuOpen = !this.isProjectsMenuOpen;
  }

  goToProjects(): void {
    this.router.navigate(['/projects']);
    this.activeProject = null;
    this.isProjectsMenuOpen = true;
  }

  goToProjectDetails(projectId: number): void {
    this.router.navigate(['/projects', projectId]);
    this.activeProject = this.projects.find(p => p.id === projectId) || null;
    this.isProjectsMenuOpen = false;
  }

  goToProjectSubItem(subItem: string): void {
    if (this.activeProject) {
      this.router.navigate(['/projects', this.activeProject.id, subItem]);
    }
  }

  goToEvents() {
    this.router.navigate(['/events']);
    this.activeProject = null;
  }
  goToReports() {
    this.router.navigate(['/reports']);
    this.activeProject = null;
  }

  goToProfile() {
    this.router.navigate(['/profile']);
    this.activeProject = null;
  }
  goToMaintenance() {
    this.router.navigate(['/maintenance']);
    this.activeProject = null;
  }
  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}