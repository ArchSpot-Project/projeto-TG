import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PhaseService } from '../../core/services/phase.service';
import { Phase } from '../../core/models/phase.model';

@Component({
  selector: 'app-create-phase-modal',
  templateUrl: './create-phase-modal.component.html',
  styleUrls: ['./create-phase-modal.component.css']
})
export class CreatePhaseModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() phaseCreated = new EventEmitter<Phase>();
  @Input() show: boolean = false;
  @Input() projectId!: number;
  @Input() lastPhaseId?: number;

  phaseName: string = '';
  phaseDescription: string = '';
  phaseEstimatedStartDate: string = '';
  phaseEstimatedEndDate: string = '';

  constructor(private phaseService: PhaseService) { }

  cancel(): void {
    this.resetForm();
    this.close.emit();
  }

  createPhase(): void {
    if (!this.phaseName || !this.phaseEstimatedStartDate || !this.phaseEstimatedEndDate) {
      alert('Preencha todos os campos obrigatórios!');
      return;
    }

    const phaseData: Phase = {
      name: this.phaseName,
      description: this.phaseDescription,
      estimatedStartDate: this.phaseEstimatedStartDate,
      estimatedEndDate: this.phaseEstimatedEndDate,
      projectId: this.projectId,
      previousPhaseId: null // será melhor implementado no futuro
    };

    this.phaseService.createPhase(this.projectId, phaseData).subscribe({
      next: (createdPhase) => {
        this.phaseCreated.emit(createdPhase);
        this.cancel();
        location.reload();
      },
      error: (err) => {
        console.error('Erro ao criar fase', err);
        alert(err.error?.message || 'Erro ao criar etapa');
      }
    });
  }

  private resetForm(): void {
    this.phaseName = '';
    this.phaseDescription = '';
    this.phaseEstimatedStartDate = '';
    this.phaseEstimatedEndDate = '';
  }
}
