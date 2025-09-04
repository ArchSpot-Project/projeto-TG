import { Component, Input } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-page-layout',
  templateUrl: './page-layout.component.html',
  styleUrl: './page-layout.component.css'
})
export class PageLayoutComponent {
  @Input() title: string = '';
  @Input() showSidebar: boolean = true; // padrão: mostrar sidebar
  @Input() showBackButton: boolean = false; // padrão: omitir icone voltar

  @Input() showStatusBar: boolean = false; // padrão: omitir cronograma

  @Input() fullWidth: boolean = false; // padrão: offset-1 col-10

  constructor(private location: Location, private router: Router) { }

  goBack(): void {
    if (window.history.length > 1) { // Se existir histórico...
      this.location.back(); // ...volta para a rota anterior
    } else {
      this.router.navigate(['/home']); // Senão fallback padrão
    }
  }
}
