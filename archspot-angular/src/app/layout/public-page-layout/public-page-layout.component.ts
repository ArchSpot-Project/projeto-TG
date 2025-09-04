import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-public-page-layout',
  templateUrl: './public-page-layout.component.html',
  styleUrl: './public-page-layout.component.css'
})
export class PublicPageLayoutComponent {
  @Input() title: string = '';
  @Input() subtitle: string = '';
}
