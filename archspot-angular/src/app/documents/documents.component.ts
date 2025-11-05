import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserProjectService } from '../core/services/user-project.service';
import { AuthService } from '../core/services/auth.service';
import { ProjectService } from '../core/services/project.service';

@Component({
  selector: 'app-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.css']
})
export class DocumentsComponent implements OnInit {

  projectId!: number;
  userId: number | null = null;
  projectUsers: any[] = [];
  projectName = '';

  constructor(
    private route: ActivatedRoute,
    private userProjectService: UserProjectService,
    private authService: AuthService,
    private projectService: ProjectService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.projectId = +params['id'];
      this.loadProjectUsers();
      this.loadProjectName();
    });

    const currentUser = this.authService.getUser();
    this.userId = currentUser?.id || null;
  }

  get isCustomerInProject(): boolean {
    if (!this.userId) return true;
    const user = this.projectUsers.find(u => u.userId === this.userId);
    return user?.role === 'CUSTOMER';
  }

  loadProjectUsers(): void {
    this.userProjectService.getUsersByProject(this.projectId).subscribe({
      next: users => this.projectUsers = users,
      error: err => console.error('Erro ao carregar usuários do projeto', err)
    });
  }

  loadProjectName(): void {
    this.projectService.getProjectById(this.projectId).subscribe({
      next: proj => this.projectName = proj.name,
      error: err => console.error('Erro ao carregar projeto', err)
    });
  }

  onDirectoryChange(directoryId: number) {
    console.log('Diretório ativo mudou:', directoryId);
  }
}
