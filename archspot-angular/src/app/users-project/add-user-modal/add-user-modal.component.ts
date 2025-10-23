import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SearchUserService, UserResponse } from '../../core/services/search-user.service';
import { UserProjectResponse } from '../../core/services/project.service';

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
  @Output() addUser = new EventEmitter<{ user: UserResponse; role: string }>();

  searchTerm = '';
  searchResults: UserResponse[] = [];
  selectedUser: UserResponse | null = null;
  selectedRole: string | null = null;
  duplicateUserMessage: string | null = null;

  constructor(private searchUserService: SearchUserService) { }

  cancel(): void {
    this.show = false;
    this.close.emit();
    this.reset();
  }

  selectUser(user: UserResponse): void {
    this.selectedUser = user;
    this.searchTerm = user.name;
    this.searchResults = [];
    this.duplicateUserMessage = null;
  }

  searchUsers(term: string): void {
    this.searchTerm = term.trim();
    if (!this.searchTerm) {
      this.searchResults = [];
      return;
    }

    this.searchUserService.search(this.searchTerm).subscribe({
      next: (res: UserResponse[]) => {
        if (!res) {
          this.searchResults = [];
          return;
        }

        const normalize = (str: string) => this.removerAcentos(str).toLowerCase();
        const normalizedTerm = normalize(this.searchTerm);

        const idMatches = res.filter(u =>
          u.id.toString().startsWith(normalizedTerm)
        );

        const nameMatches = res.filter(
          u =>
            normalize(u.name).startsWith(normalizedTerm) &&
            !idMatches.includes(u)
        );

        const containsMatches = res.filter(
          u =>
            !idMatches.includes(u) &&
            !nameMatches.includes(u) &&
            normalize(u.name).includes(normalizedTerm)
        );

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

    const alreadyAdded = this.existingUsers.some(
      u => Number(u.userId) === Number(this.selectedUser!.id)
    );

    if (alreadyAdded) {
      alert('Usuário já está associado ao projeto.');
      this.cancel();
      return;
    }
    this.addUser.emit({ user: this.selectedUser, role: this.selectedRole });
    this.cancel();
  }

  private reset() {
    this.searchTerm = '';
    this.searchResults = [];
    this.selectedUser = null;
    this.selectedRole = null;
    this.duplicateUserMessage = null;
  }

  private removerAcentos(str: string): string {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }
}
