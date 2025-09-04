import { Component } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalNovoEventoComponent } from '../../components/modal-novo-evento/modal-novo-evento.component';

@Component({
  selector: 'app-events-page',
  templateUrl: './events-page.component.html',
  styleUrl: './events-page.component.css'
})
export class EventsPageComponent {

  constructor(private modalService: NgbModal) {}
  
  openNovoEventoModal() {
  this.modalService.open(ModalNovoEventoComponent, {
    centered: true,
    size: 'md',
    backdrop: 'static' // opcional
  });
}
}
