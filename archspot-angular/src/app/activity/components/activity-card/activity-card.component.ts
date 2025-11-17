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

  private activityRenderers: Record<string, (meta: any) => string> = {
    'PHASE_CREATED': (m) =>
      `Etapa criada.<div><strong>${m.phaseName}</strong></div>`,

    'PHASE_UPDATED': (m) =>
      `Etapa atualizada.<div><strong>${m.phaseName}</strong></div>`,

    'PHASE_STARTED': (m) =>
      `Etapa iniciada.<div><strong>${m.phaseName}</strong></div>`,

    'PHASE_FINISHED': (m) =>
      `Etapa finalizada.<div><strong>${m.phaseName}</strong></div>`,

    'INSTALLMENT_CREATED': (m) =>
      `Parcela criada.<div><strong>${m.installmentDescription}</strong> no valor de <strong>R$ ${m.value}</strong></div>`,

    'INSTALLMENT_UPDATED': (m) =>
      `Parcela atualizada.<div><strong>${m.installmentDescription}</strong> no valor de <strong>R$ ${m.value}</strong></div>`,

    'INSTALLMENT_PAID': (m) =>
      `Parcela paga.<div><strong>${m.installmentDescription}</strong> no valor de <strong>R$ ${m.value}</strong></div>`,

    // 👇 quando não existe renderizador
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
}