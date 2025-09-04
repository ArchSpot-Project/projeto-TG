import { Component } from '@angular/core';

@Component({
  selector: 'app-report-financeiro-projeto',
  templateUrl: './report-financeiro-projeto.component.html',
  styleUrl: './report-financeiro-projeto.component.css'
})
export class ReportFinanceiroProjetoComponent {
  isGenerated = false;

  // Campos simulados do formulário — pode ser substituído por model/formGroup depois
  formData = {
    projeto: 'selecione'
  };

  gerarRelatorio(): void {
    this.isGenerated = true;
  }

  voltarEdicao(): void {
    this.isGenerated = false;
  }
}
