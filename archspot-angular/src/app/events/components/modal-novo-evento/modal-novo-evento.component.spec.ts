import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalNovoEventoComponent } from './modal-novo-evento.component';

describe('ModalNovoEventoComponent', () => {
  let component: ModalNovoEventoComponent;
  let fixture: ComponentFixture<ModalNovoEventoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModalNovoEventoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalNovoEventoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
