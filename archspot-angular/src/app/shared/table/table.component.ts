import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})
export class TableComponent implements OnInit {
  @Input() title = '';

  documents: any[] = [];

  ngOnInit(): void {
    // documents de exemplo - serão dados do back ou API do google drive
    this.documents = [
      {
        name: `${this.title} Documento 1`,
        owner: 'Ana',
        modifiedTime: new Date('2025-09-10T10:30:00'),
        size: 2.4
      },
      {
        name: `${this.title} Documento 2`,
        owner: 'Fernando',
        modifiedTime: new Date('2025-12-10T14:30:00'),
        size: 1.8
      },
      {
        name: `${this.title} Documento 3`,
        owner: 'Helio',
        modifiedTime: new Date('2025-11-10T16:30:00'),
        size: 2.1
      }
    ];
  }

  //ações do dropdown
  abrirDoc(doc: any) {
    console.log('Abrir:', doc.name);
    alert(`Abrindo: ${doc.name}`);
  }

  downloadDoc(doc: any) {
    console.log('Baixar:', doc.name);
    alert(`Baixando: ${doc.name}`);
  }

  substituirDoc(doc: any) {
    console.log('Substituir:', doc.name);
    alert(`Substituindo: ${doc.name}`);
  }

  renomearDoc(doc: any) {
    console.log('Renomear:', doc.name);
    const newName = prompt('Digite o novo nome', doc.name);
    if (newName) doc.name = newName;
  }

  deletarDoc(doc: any) {
    console.log('Deletar:', doc.name);
    if (confirm(`Deseja realmente deletar ${doc.name}?`)) {
      this.documents = this.documents.filter(d => d !== doc);
    }
  }
}
