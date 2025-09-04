import { Component } from '@angular/core';

@Component({
  selector: 'app-report-cronograma-geral',
  templateUrl: './report-cronograma-geral.component.html',
  styleUrl: './report-cronograma-geral.component.css'
})
export class ReportCronogramaGeralComponent {
  isGenerated = false;

  // Campos simulados do formulário — pode ser substituído por model/formGroup depois
  formData = {
    periodoInicio: '',
    periodoFim: '',
    status: 'todos',
    cliente: 'todos',
    projetista: 'todos'
  };

  gerarRelatorio(): void {
    this.isGenerated = true;
  }

  voltarEdicao(): void {
    this.isGenerated = false;
  }
}
