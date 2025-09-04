import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-modal-novo-evento',
  templateUrl: './modal-novo-evento.component.html',
  styleUrl: './modal-novo-evento.component.css'
})
export class ModalNovoEventoComponent {

    constructor(public activeModal: NgbActiveModal) {}

}
