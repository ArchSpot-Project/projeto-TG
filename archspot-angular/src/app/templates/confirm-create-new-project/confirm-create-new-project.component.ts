import { Component, Input, Output, EventEmitter } from '@angular/core';
import { UserResponse } from '../../core/services/search-user.service';

interface Etapa {
  nome: string;
  duracao?: number;
}

@Component({
  selector: 'app-confirm-create-new-project-modal',
  templateUrl: './confirm-create-new-project.component.html',
  styleUrls: ['./confirm-create-new-project.component.css']
})
export class ConfirmCreateNewProjectModalComponent {
  @Input() show = false;
  @Output() close = new EventEmitter<void>();
  @Output() created = new EventEmitter<void>();
  @Output() editPhases = new EventEmitter<void>();

  projectName = '';
  projectDescription = '';
  estimatedStartDate = '';

  etapas: Etapa[] = [
    { nome: 'Estudo Preliminar', duracao: 5 },
    { nome: 'Anteprojeto', duracao: 5 },
    { nome: 'Projeto Legal', duracao: 5 },
    { nome: 'Projeto Executivo', duracao: 5 }
  ];

  etapasSelecionadas: string[] = [];

  roles: string[] = ['STAFF', 'CUSTOMER', 'EXTERNAL_COLLABORATOR'];
  showAddModal = false;
  users: { id: number; name: string; role: string }[] = [];

  onCancel() {
    this.editPhases.emit();
  }

  toggleEtapa(etapaNome: string) {
    if (this.etapasSelecionadas.includes(etapaNome)) {
      this.etapasSelecionadas = this.etapasSelecionadas.filter(e => e !== etapaNome);
    } else {
      this.etapasSelecionadas.push(etapaNome);
    }
  }

  isSelected(etapaNome: string): boolean {
    return this.etapasSelecionadas.includes(etapaNome);
  }

  openAddUserModal() {
    this.showAddModal = true;
  }

  cancelAdd() {
    this.showAddModal = false;
  }

  handleAddUser(data: { user: UserResponse; role: string }) {
    const userObj = {
      id: data.user.id,
      name: data.user.name,
      role: data.role
    };
    if (!this.users.find(u => u.id === userObj.id)) {
      this.users.push(userObj);
    }
  }

  removeUser(userId: number) {
    this.users = this.users.filter(u => u.id !== userId);
  }

  createProject() {
    if (!this.projectName.trim()) {
      alert('Digite um nome para o projeto.');
      return;
    }

    const etapasSelecionadasDetalhes = this.etapas
      .filter(e => this.etapasSelecionadas.includes(e.nome))
      .map(e => ({ nome: e.nome, duracao: e.duracao }));

    console.log('Novo projeto criado:', {
      nome: this.projectName,
      descricao: this.projectDescription,
      etapas: etapasSelecionadasDetalhes,
      equipe: this.users
    });

    this.created.emit();
  }
}
