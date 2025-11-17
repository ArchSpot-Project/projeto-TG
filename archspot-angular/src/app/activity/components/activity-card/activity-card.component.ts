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

  get description(): string {
    const meta = this.activity.metadata;

    switch (this.activity.type) {
      case 'PHASE_CREATED':
        return `Etapa criada. <div><strong>${meta['phaseName']}</strong>.</div>`;
      case 'PHASE_UPDATED':
        return `Etapa atualizada. <div><strong>${meta['phaseName']}</strong>.</div>`;
      case 'PHASE_STARTED':
        return `Etapa iniciada. <div><strong>${meta['phaseName']}</strong>.</div>`;
      case 'PHASE_FINISHED':
        return `Etapa Finalizada. <div><strong>${meta['phaseName']}</strong>.</div>`;

      case 'INSTALLMENT_PAID':
        return `Parcela paga.
                  <div><strong>${meta['installmentDescription']}</strong>  
                  no valor de <strong>R$ ${meta['value']}</strong>.</div>`;
      default:
        return 'Atividade registrada.';
    }
  }

  badgeColors: Record<string, string> = {
    'ADMIN': 'bg-archspot-berinjela',
    'STAFF': 'bg-archspot-petroleo',
    'CUSTOMER': 'background-color',
    'EXTERNAL_COLLABORATOR': 'background-color'
  };

  getRoleBadgeClass(): string {
    return this.badgeColors[this.activity.userRole?.toUpperCase() || '']
      || 'text-bg-secondary';
  }
}