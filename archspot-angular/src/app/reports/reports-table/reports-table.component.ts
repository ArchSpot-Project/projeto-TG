import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface ReportColumn {
  campo: string;
  label: string;
  pipe?: 'date' | 'currency' | 'statusTranslate' | 'paymentMethod' | 'paymentStatus' | 'phaseStatus' | 'financialStatus';
}

@Component({
  selector: 'app-reports-table',
  templateUrl: './reports-table.component.html',
  styleUrls: ['./reports-table.component.css']
})
export class ReportsTableComponent {
  @Input() colunas: ReportColumn[] = [];
  @Input() registros: any[] = [];
  @Input() loading = false;
  @Input() error = '';
  @Input() titulo = '';
  @Input() pdfNomeArquivo = 'relatorio.pdf';

  @Output() voltar = new EventEmitter<void>();

  baixarPDF(): void {
    const tabela = document.getElementById('relatorioTabela');
    if (!tabela) return;

    const container = document.createElement('div');
    container.style.padding = '15px';
    container.style.backgroundColor = 'white';
    container.style.position = 'absolute';
    container.style.top = '-9999px';
    container.appendChild(tabela.cloneNode(true));
    document.body.appendChild(container);

    import('html2canvas').then(html2canvas => {
      import('jspdf').then(jsPDF => {
        html2canvas.default(container, { scale: 2 }).then(canvas => {
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF.jsPDF('p', 'mm', 'a4');
          const imgProps = pdf.getImageProperties(imgData);
          const pdfWidth = pdf.internal.pageSize.getWidth() - 20;
          const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

          pdf.setFontSize(16);
          pdf.setFont('helvetica', 'bold');
          pdf.text(this.titulo, pdf.internal.pageSize.getWidth() / 2, 15, { align: 'center' });

          pdf.addImage(imgData, 'PNG', 10, 25, pdfWidth, pdfHeight);
          pdf.save(this.pdfNomeArquivo);

          document.body.removeChild(container);
        });
      });
    });
  }
}
