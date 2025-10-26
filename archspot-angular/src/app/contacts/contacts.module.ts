import { NgModule } from "@angular/core";
import { ContactsComponent } from "./contacts.component";
import { CommonModule } from "@angular/common";
import { LayoutModule } from "../layout/layout.module";
import { ContactsRoutingModule } from "./contacts-routing.module";


@NgModule({
  declarations: [ContactsComponent],
  imports: [
    CommonModule,
    ContactsRoutingModule,
    LayoutModule
  ]
})
export class ContactsModule {}
