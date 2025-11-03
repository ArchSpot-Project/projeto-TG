import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { UserProjectService } from '../../core/services/user-project.service';

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

  activeProject: Project | null = null;
  isAdmInProject: boolean = false;

  projectMenuItems = [
    { key: 'drawings', icon: 'assets/img/icons/10-desenhos.png', label: 'Desenhos' },
    { key: 'documents', icon: 'assets/img/icons/07-documentos.png', label: 'Documentos' },
    { key: 'payments', icon: 'assets/img/icons/13-financeiro.png', label: 'Pagamentos' },
    { key: 'photos', icon: 'assets/img/icons/11-fotos.png', label: 'Fotos' },
    { key: 'schedule', icon: 'assets/img/icons/09-cronograma2.png', label: 'Cronograma' },
  ];

  generalMenuItems = [
    { icon: 'assets/img/icons/file-richtext.svg', label: 'Relatórios', action: () => this.goToReports() },
    { icon: 'assets/img/icons/02-contact.png', label: 'Contatos', action: () => this.goToContacts() },
  ];

  profileMenuItems = [
    { icon: 'assets/img/icons/04-perfil.png', label: 'Perfil', action: () => this.goToProfile() }
  ];

  helpMenuItems = [
    { icon: 'assets/img/icons/question-circle.svg', label: 'Sobre', action: () => this.goToAbout() },
    { icon: 'assets/img/icons/box-arrow-right.svg', label: 'Sair', action: () => this.logout() }
  ];

  constructor(
    private authService: AuthService,
    private userProjectService: UserProjectService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Atualiza sempre que mudar de rota
    this.router.events.pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => this.checkActiveProject());

    this.checkActiveProject();
  }

  /** Verifica se a URL atual corresponde a um projeto específico */
  checkActiveProject(): void {
    const urlSegments = this.router.url.split('/');
    const projectIdString = urlSegments[2];

    if (urlSegments[1] === 'projects' && projectIdString) {
      const projectId = parseInt(projectIdString, 10);
      this.activeProject = { id: projectId, name: `Projeto ${projectId}` };
      this.checkIfUserIsAdm(projectId);
    } else {
      this.activeProject = null;
      this.isAdmInProject = false;
    }
  }

  /** checar se role é ADMIN */
  private checkIfUserIsAdm(projectId: number): void {
    const user = this.authService.getUser();
    if (!user?.id) {
      this.isAdmInProject = false;
      return;
    }

    this.userProjectService.getUsersByProject(projectId).subscribe({
      next: (users) => {
        const match = users.find(u => u.userId === user.id && u.role === 'ADMIN');
        this.isAdmInProject = !!match;
      },
      error: (err) => {
        console.error('Erro ao verificar role do usuário no projeto:', err);
        this.isAdmInProject = false;
      }
    });
  }

  goToProjects(): void {
    this.router.navigate(['/projects']);
    this.activeProject = null;
  }

  goToContacts(): void {
    this.router.navigate(['/contacts']);
    this.activeProject = null;
  }

  goToProjectDetails(projectId: number): void {
    this.router.navigate(['/projects', projectId]);
  }

  goToProjectSubItem(subItem: string): void {
    if (this.activeProject) {
      this.router.navigate(['/projects', this.activeProject.id, subItem]);
    }
  }

  goToReports() { this.router.navigate(['/reports']); }
  goToProfile() { this.router.navigate(['/profile']); }
  goToAbout() { this.router.navigate(['/about']); }

  goToUsersProject() {
    if (this.activeProject) {
      this.router.navigate(['/projects', this.activeProject.id, 'users-project']);
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
