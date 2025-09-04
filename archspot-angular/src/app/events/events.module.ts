import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EventsRoutingModule } from './events-routing.module';
import { EventsPageComponent } from './pages/events-page/events-page.component';
import { CalendarComponent } from './components/calendar/calendar.component';
import { LayoutModule } from '../layout/layout.module';
import { ModalNovoEventoComponent } from './components/modal-novo-evento/modal-novo-evento.component';


@NgModule({
  declarations: [
    EventsPageComponent,
    CalendarComponent,
    ModalNovoEventoComponent
  ],
  imports: [
    CommonModule,
    EventsRoutingModule,
    LayoutModule
  ]
})
export class EventsModule { }
