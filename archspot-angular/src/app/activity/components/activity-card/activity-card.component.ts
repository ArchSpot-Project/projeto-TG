import { Component, Input } from '@angular/core';
import { Activity } from '../../../core/models/activity.model';

@Component({
  selector: 'app-activity-card',
  templateUrl: './activity-card.component.html',
  styleUrls: ['./activity-card.component.css']
})
export class ActivityCardComponent {
  @Input() activity!: Activity;

  get avatarUrl(): string {
    if (!this.activity.userAvatarUrl || this.activity.userAvatarUrl.trim() === '') {
      return 'assets/img/default-avatar.png';
    }
    return 'http://localhost:8080/' + this.activity.userAvatarUrl;
  }

  private activityRenderers: Record<string, (m: any) => string> = {
    // ---------- PHASES ----------
    'PHASE_CREATED': (m) =>
      `Etapa criada.<div><strong>${m.phaseName}</strong></div>`,
    'PHASE_UPDATED': (m) =>
      `Etapa atualizada.<div><strong>${m.phaseName}</strong></div>`,
    'PHASE_STARTED': (m) =>
      `Etapa iniciada.<div><strong>${m.phaseName}</strong></div>`,
    'PHASE_FINISHED': (m) =>
      `Etapa finalizada.<div><strong>${m.phaseName}</strong></div>`,

    // ---------- INSTALLMENTS ----------
    'INSTALLMENT_CREATED': (m) =>
      `Parcela criada.<div><strong>${m.installmentDescription}</strong> no valor de <strong>R$ ${m.value}</strong></div>`,
    'INSTALLMENT_UPDATED': (m) =>
      `Parcela atualizada.<div><strong>${m.installmentDescription}</strong> no valor de <strong>R$ ${m.value}</strong></div>`,
    'INSTALLMENT_PAID': (m) =>
      `Parcela paga.<div><strong>${m.installmentDescription}</strong> no valor de <strong>R$ ${m.value}</strong></div>`,

    // ---------- DOCUMENTS ----------
    'DOCUMENT_UPLOADED': (m) =>
      `Documento enviado.<div><strong>${m.fileName}</strong> no diretório <strong>${m.directoryName}</strong></div>`,
    'DOCUMENT_INFO_UPDATED': (m) =>
      `Informações do documento atualizadas.
      <div><strong>${m.fileOldName}</strong> → <strong>${m.fileNewName}</strong></div>`,
    'DOCUMENT_VERSIONED': (m) =>
      `Nova versão do documento.<div><strong>${m.fileName}</strong> (v${m.documentVersion})</div>`,
    'DOCUMENT_DELETED': (m) =>
      `Documento removido.<div><strong>${m.fileName}</strong> do diretório <strong>${m.directoryName}</strong></div>`,

    // ---------- PHOTOS ----------
    'PHOTO_UPLOADED': (m) =>
      `Foto enviada.<div><strong>${m.photoName}</strong> no álbum <strong>${m.albumName}</strong></div>`,
    'PHOTO_UPDATED': (m) =>
      `Foto atualizada.
      <div><strong>${m.photoOldName}</strong> → <strong>${m.photoNewName}</strong> no álbum <strong>${m.albumName}</strong></div>`,
    'PHOTO_DELETED': (m) =>
      `Foto removida.<div><strong>${m.photoName}</strong> do álbum <strong>${m.albumName}</strong></div>`,

    // ---------- USERS IN PROJECT ----------
    'USER_ASSIGNED_TO_PROJECT': (m) =>
      `Usuário adicionado ao projeto.
      <div><strong>${m.userAssignedName}</strong> como <strong>${m.assignedRole}</strong></div>`,
    'USER_REMOVED_FROM_PROJECT': (m) =>
      `Usuário removido do projeto.
      <div><strong>${m.userRemovedName}</strong></div>`,
    'USER_ROLE_UPDATED': (m) =>
      `Função atualizada.
      <div><strong>${m.userAssignedName}</strong>: <strong>${m.oldRole}</strong> → <strong>${m.newRole}</strong></div>`,

    // ---------- COMMENTS ----------
    'COMMENT_ADDED': (m) =>
      `Novo comentário no documento <strong>${m.documentName}</strong>.<div>${m.commentText}</div>`,
    'COMMENT_DELETED': () =>
      `Comentário removido.`,

    // ---------- PROJECT ----------
    'PROJECT_UPDATED': (m) =>
      `Projeto atualizado.
      <div><strong>${m.projectName}</strong></div>`,

    'PROJECT_FINALIZED': () =>
      `Projeto finalizado.`,
    'PROJECT_CANCELLED': () =>
      `Projeto cancelado.`,

    // ---------- DEFAULT ----------
    'DEFAULT': () => 'Atividade registrada.'
  };


  get description(): string {
    const renderer = this.activityRenderers[this.activity.type]
      || this.activityRenderers['DEFAULT'];


    return renderer(this.activity.metadata || {});
  }

  badgeColors: Record<string, string> = {
    'ADMIN': 'bg-archspot-berinjela',
    'STAFF': 'bg-archspot-petroleo',
    'CUSTOMER': 'bg-archspot-samambaia',
    'EXTERNAL_COLLABORATOR': 'bg-archspot-ceramica'
  };

  getRoleBadgeClass(): string {
    return this.badgeColors[this.activity.userRole?.toUpperCase() || '']
      || 'text-bg-secondary';
  }

  get shouldShowPhotoPreview(): boolean {
    const types = ['PHOTO_UPLOADED', 'PHOTO_UPDATED'];
    return types.includes(this.activity.type) &&
      !!this.activity.metadata?.['fileUrl'];
  }

  get photoPreviewUrl(): string {
    const url = this.activity.metadata?.['fileUrl'];
    if (!url) return '';
    return 'http://localhost:8080/' + url;
  }

  get shouldShowDocumentPreview(): boolean {
    const types = [
      'DOCUMENT_UPLOADED',
      'DOCUMENT_INFO_UPDATED',
      'DOCUMENT_VERSIONED'
    ];
    return types.includes(this.activity.type);
  }

  get documentPreviewUrl(): string {
    return 'assets/img/document-default.jpg';
  }

  get shouldShowInstallmentPreview(): boolean {
    const types = [
      'INSTALLMENT_CREATED',
      'INSTALLMENT_UPDATED',
      'INSTALLMENT_PAID'
    ];
    return types.includes(this.activity.type);
  }

  get installmentPreviewUrl(): string {
    return 'assets/img/payment-default.jpg';
  }

  get shouldShowPhasePreview(): boolean {
    const types = [
      'PHASE_CREATED',
      'PHASE_UPDATED',
      'PHASE_STARTED',
      'PHASE_FINISHED'
    ];
    return types.includes(this.activity.type);
  }

  get phasePreviewUrl(): string {
    return 'assets/img/task-icon.png';
  }

  get shouldShowCommentPreview(): boolean {
    const types = ['COMMENT_ADDED', 'COMMENT_DELETED'];
    return types.includes(this.activity.type);
  }

  get commentPreviewUrl(): string {
    return 'assets/img/comment-icon.png';
  }

  get shouldShowUserPreview(): boolean {
    const types = [
      'USER_ASSIGNED_TO_PROJECT',
      'USER_REMOVED_FROM_PROJECT',
      'USER_ROLE_UPDATED'
    ];
    return types.includes(this.activity.type) && !!this.activity.metadata?.['fileUrl']
  }

  get userPreviewUrl(): string {
    const url =
      this.activity.metadata?.['fileUrl']

    if (!url) return '';
    return 'http://localhost:8080/' + url;
  }


}