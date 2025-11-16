import { Component, Input } from '@angular/core';
import { Activity } from '../../../core/models/activity.model';

@Component({
  selector: 'app-activity-card',
  templateUrl: './activity-card.component.html',
  styleUrls: ['./activity-card.component.css']
})
export class ActivityCardComponent {
  @Input() activity!: Activity;

  get description(): string {
    const meta = this.activity.metadata;

    switch (this.activity.type) {
      case 'PHASE_STARTED':
        return `Iniciou a etapa "${meta['phaseName']}".`;
      case 'PHASE_FINISHED':
        return `Finalizou a etapa "${meta['phaseName']}".`;
      case 'INSTALLMENT_PAID':
        return `Pagou a parcela #${meta['installmentNumber']} no valor de R$ ${meta['value']}.`;
      default:
        return 'Atividade registrada.';
    }
  }
}