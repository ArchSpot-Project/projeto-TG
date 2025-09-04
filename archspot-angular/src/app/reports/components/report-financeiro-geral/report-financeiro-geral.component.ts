import { Component } from '@angular/core';

@Component({
  selector: 'app-report-financeiro-geral',
  templateUrl: './report-financeiro-geral.component.html',
  styleUrl: './report-financeiro-geral.component.css'
})
export class ReportFinanceiroGeralComponent {
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
