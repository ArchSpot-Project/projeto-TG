import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { PhaseService } from '../../core/services/phase.service';

@Component({
  selector: 'app-edit-phase-modal',
  templateUrl: './edit-phase-modal.component.html',
  styleUrls: ['./edit-phase-modal.component.css']
})
export class EditPhaseModalComponent implements OnInit, OnChanges {
  @Input() show: boolean = false;
  @Output() close = new EventEmitter<void>();

  @Input() phaseId!: number;
  @Input() phaseName: string = '';
  @Input() phaseDescription: string = '';
  @Input() phaseEstimatedStartDate: string = '';
  @Input() phaseEstimatedEndDate: string = '';
  @Input() phaseRealStartDate: string = '';
  @Input() phaseRealEndDate: string = '';
  @Input() phaseStatus: string = '';
  @Input() phaseIndex?: number;

  private originalPhase: any = {};

  constructor(private phaseService: PhaseService) { }

  ngOnInit(): void { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['phaseId'] && this.phaseId) {
      // armazena os valores originais ao abrir o modal
      this.originalPhase = {
        phaseName: this.phaseName,
        phaseDescription: this.phaseDescription,
        phaseEstimatedStartDate: this.formatDateForInput(this.phaseEstimatedStartDate),
        phaseEstimatedEndDate: this.formatDateForInput(this.phaseEstimatedEndDate),
        phaseRealStartDate: this.formatDateForInput(this.phaseRealStartDate),
        phaseRealEndDate: this.formatDateForInput(this.phaseRealEndDate),
        duration: null
      };

      // converte datas para o formato YYYY-MM-DD para os inputs
      this.phaseEstimatedStartDate = this.originalPhase.phaseEstimatedStartDate;
      this.phaseEstimatedEndDate = this.originalPhase.phaseEstimatedEndDate;
      this.phaseRealStartDate = this.originalPhase.phaseRealStartDate;
      this.phaseRealEndDate = this.originalPhase.phaseRealEndDate;
    }
  }

  //atualiza a etapa
  updatePhase(): void {
    //validação de datas
    if (this.phaseEstimatedStartDate && this.phaseEstimatedEndDate) {
      const start = new Date(this.phaseEstimatedStartDate);
      const end = new Date(this.phaseEstimatedEndDate);
      if (end < start) {
        alert('A data de término prevista não pode ser anterior à data de início prevista.');
        return;
      }
    }

    let duration: number | null = null;
    if (this.phaseEstimatedStartDate && this.phaseEstimatedEndDate) {
      const start = new Date(this.phaseEstimatedStartDate);
      const end = new Date(this.phaseEstimatedEndDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24); //converte milisegundos para dias
    }

    // payload completo enviado ao backend
    const updatedPhase = {
      name: this.phaseName,
      description: this.phaseDescription || null,
      estimatedStartDate: this.normalizeDate(this.phaseEstimatedStartDate), 
      estimatedEndDate: this.normalizeDate(this.phaseEstimatedEndDate),   
      realStartDate: this.disableRealDates ? null : this.normalizeDateTime(this.phaseRealStartDate), 
      realEndDate: this.disableRealDates ? null : this.normalizeDateTime(this.phaseRealEndDate),
      duration: duration,
      projectId: this.originalPhase.projectId 
    };

    this.phaseService.updatePhase(this.phaseId, updatedPhase).subscribe({
      next: () => {
        alert('Etapa atualizada com sucesso!');
        this.close.emit();
        location.reload();
      },
      error: (err) => {
        console.error('Erro ao atualizar fase:', err);
        alert('Erro ao atualizar a etapa. Veja console.');
      }
    });
  }

  deletePhase(): void {
    if (!confirm('Deseja realmente excluir esta etapa?')) return;
    this.phaseService.deletePhase(this.phaseId).subscribe({
      next: () => {
        alert('Etapa excluída com sucesso!');
        this.close.emit();
        location.reload();
      },
      error: (err) => {
        console.error(err);
        alert('Erro ao excluir a etapa. Não é possível excluir uma etapa predecessora de outra.');
      }
    });
  }

  //cancela e fecha o modal
  cancel(): void {
    this.resetForm();
    this.close.emit();
    location.reload();
  }

  private resetForm(): void {
    this.phaseName = '';
    this.phaseDescription = '';
    this.phaseEstimatedStartDate = '';
    this.phaseEstimatedEndDate = '';
    this.phaseRealStartDate = '';
    this.phaseRealEndDate = '';
  }

  // verifica se os campos de data real devem estar bloqueados
  get disableRealDates(): boolean {
    return this.phaseStatus?.toUpperCase() !== 'COMPLETED';
  }

  // converte datas do backend para YYYY-MM-DD para inputs
  private formatDateForInput(date: string | null | undefined): string | null {
    if (!date) return null;
    const d = new Date(date);
    return d.toISOString().slice(0, 10);
  }

  // converte valores do input para YYYY-MM-DD antes de enviar ao backend 
  private normalizeDate(date: string | null | undefined): string | null {
    if (!date) return null;
    const [year, month, day] = date.split('-');
    return `${year}-${month}-${day}`;
  }

  // normaliza datas para LocalDateTime YYYY-MM-DDTHH:mm:ss 
  private normalizeDateTime(date: string | null | undefined): string | null {
    if (!date) return null;
    const [year, month, day] = date.split('-');
    return `${year}-${month}-${day}T12:00:00`;
  }
}
