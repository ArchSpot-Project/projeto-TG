import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SearchUserService, UserResponse } from '../../core/services/search-user.service';
import { UserProjectResponse } from '../../core/models/project.model';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-add-user-modal',
  templateUrl: './add-user-modal.component.html',
  styleUrls: ['./add-user-modal.component.css']
})
export class AddUserModalComponent {
  @Input() roles: string[] = [];
  @Input() existingUsers: UserProjectResponse[] = [];
  @Input() show = false;

  @Output() close = new EventEmitter<void>();
  @Output() addUser = new EventEmitter<{ user: UserResponse; role: string; reassignAdmin?: boolean }>();

  searchTerm = '';
  searchResults: UserResponse[] = [];
  selectedUser: UserResponse | null = null;
  selectedRole: string | null = null;

  constructor(private searchUserService: SearchUserService, private toast: ToastService) { }

  cancel(): void {
    this.show = false;
    this.close.emit();
    this.reset();
  }

  selectUser(user: UserResponse): void {
    this.selectedUser = user;
    this.searchTerm = user.name;
    this.searchResults = [];
  }

  searchUsers(term: string): void {
    this.searchTerm = term.trim();
    if (!this.searchTerm) {
      this.searchResults = [];
      return;
    }

    //busca de usuários
    this.searchUserService.search(this.searchTerm).subscribe({
      next: (res: UserResponse[]) => {
        if (!res) {
          this.searchResults = [];
          return;
        }

        const normalize = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
        const normalizedTerm = normalize(this.searchTerm);

        const idMatches = res.filter(u => u.id.toString().startsWith(normalizedTerm));
        const nameMatches = res.filter(u => normalize(u.name).startsWith(normalizedTerm) && !idMatches.includes(u));
        const containsMatches = res.filter(u => !idMatches.includes(u) && !nameMatches.includes(u) && normalize(u.name).includes(normalizedTerm));

        this.searchResults = [...idMatches, ...nameMatches, ...containsMatches];
      },
      error: (err: any) => {
        console.error('Erro ao buscar usuários', err);
        this.searchResults = [];
      }
    });
  }

  confirmAdd(): void {
    if (!this.selectedUser || !this.selectedRole) return;

    const alreadyAdded = this.existingUsers.some(u => Number(u.userId) === Number(this.selectedUser!.id));
    if (alreadyAdded) {
      this.toast.showError('Usuário já está associado ao projeto.');
      this.reset();
      return;
    }

    // regra de único gerente para um projeto
    if (this.selectedRole === 'ADMIN') {
      const currentAdmin = this.existingUsers.find(u => u.role === 'ADMIN');
      if (currentAdmin) {
        const confirmed = confirm(
          `⚠️ ATENÇÃO: você está adicionando o usuário ${this.selectedUser!.name} como GERENTE.\n` +
          `Sua função será alterada para COLABORADOR INTERNO.\n` +
          `Deseja continuar?`
        );
        if (!confirmed) return;

        this.addUser.emit({ user: this.selectedUser!, role: this.selectedRole!, reassignAdmin: true });
        this.cancel();
        return;
      }
    }

    // fluxo normal
    this.addUser.emit({ user: this.selectedUser!, role: this.selectedRole! });
    this.cancel();
  }

  private reset() {
    this.searchTerm = '';
    this.searchResults = [];
    this.selectedUser = null;
    this.selectedRole = null;
  }
}
