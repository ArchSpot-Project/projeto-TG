import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { ProjectService } from '../../core/services/project.service';
import { AuthService } from '../../core/services/auth.service';
import { UserResponse } from '../../core/services/search-user.service';

@Component({
  selector: 'app-create-project-modal',
  templateUrl: './create-project-modal.component.html',
  styleUrls: ['./create-project-modal.component.scss']
})
export class CreateProjectModalComponent implements OnInit {
  @Input() show: boolean = false;
  @Input() currentUserId?: number;
  @Input() currentUserName?: string;
  @Output() close = new EventEmitter<void>();
  @Output() projectCreated = new EventEmitter<void>();

  roles: string[] = ['STAFF', 'CUSTOMER'];
  projectName: string = '';
  projectDescription: string = '';
  estimatedStartDate: string = '';
  estimatedEndDate: string = '';

  showAddModal: boolean = false;
  users: { id: number; name: string; role: string }[] = [];

  constructor(
    private projectService: ProjectService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    if (!this.currentUserId || !this.currentUserName) {
      const user = this.authService.getUser();
      if (user) {
        this.currentUserId = user.id;
        this.currentUserName = user.name;
      } else {
        console.error('Usuário não autenticado');
        alert('Erro: usuário não logado.');
      }
    }
  }

  cancel(): void {
    this.resetForm();
    this.close.emit();
  }

  openAddUserModal(): void {
    this.showAddModal = true;
  }

  cancelAdd(): void {
    this.showAddModal = false;
  }

  //adicionar usuarios ao projeto - incluindo o usuário corrente
  handleAddUser(data: { user: UserResponse; role: string }) {
    const userObj = {
      id: data.user.id,
      name: data.user.name,
      role: data.role
    };

    const exists = this.users.find(u => u.id === userObj.id);
    if (!exists) {
      this.users.push(userObj);
    }
  }

  removeUser(userId: number): void {
    this.users = this.users.filter(u => u.id !== userId);
  }

  createProject(): void {
    if (!this.projectName.trim()) {
      alert('O nome do projeto é obrigatório.');
      return;
    } else if (!this.estimatedStartDate) {
      alert('A data de início é obrigatória.');
      return;
    } else if (!this.estimatedEndDate) {
      alert('A data de término é obrigatória.');
      return;
    }

    //validação de datas
    if (this.estimatedStartDate && this.estimatedEndDate) {
      const start = new Date(this.estimatedStartDate);
      const end = new Date(this.estimatedEndDate);
      if (start > end) {
        alert('A data de início não pode ser maior que a data de término.');
        return;
      }
    }

    //dados do projeto a ser criado
    const projectData = {
      name: this.projectName,
      description: this.projectDescription,
      estimatedStartDate: this.estimatedStartDate,
      estimatedEndDate: this.estimatedEndDate,
      status: 'PLANNED'
    };

    //criando projeto
    this.projectService.createProject(projectData).subscribe({
      next: (project) => {
        const assignments = [];

        // associa usuário logado como ADMIN
        if (this.currentUserId) {
          assignments.push(
            this.projectService.assignUserToProject(project.id, this.currentUserId, 'ADMIN')
          );
        }

        // associa colaboradores adicionados
        this.users.forEach(user => {
          assignments.push(
            this.projectService.assignUserToProject(project.id, user.id, user.role)
          );
        });

        forkJoin(assignments).subscribe({
          next: () => {
            alert(`Projeto "${project.name}" criado com sucesso!`);
            this.projectCreated.emit();
            this.resetForm();
            this.users = [];
            this.cancel();
          },
          error: (err) => {
            console.error('Erro ao associar usuários:', err);
            alert('Projeto criado, mas os usuários não foram associados.');
            this.projectCreated.emit();
            this.resetForm();
            this.users = [];
            this.cancel();
          }
        });
      },
      error: (err) => {
        console.error('Erro ao criar projeto:', err);
        alert('Erro ao criar projeto.');
      }
    });
  }

  private resetForm(): void {
    this.projectName = '';
    this.projectDescription = '';
    this.estimatedStartDate = '';
    this.estimatedEndDate = '';
  }
}
