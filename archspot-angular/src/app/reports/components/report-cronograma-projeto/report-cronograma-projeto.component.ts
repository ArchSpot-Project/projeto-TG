import { Component } from '@angular/core';

@Component({
  selector: 'app-report-cronograma-projeto',
  templateUrl: './report-cronograma-projeto.component.html',
  styleUrl: './report-cronograma-projeto.component.css'
})
export class ReportCronogramaProjetoComponent {
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
