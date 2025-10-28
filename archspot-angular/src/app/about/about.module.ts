import { CommonModule } from "@angular/common";
import { AboutRoutingModule } from "./about-routing.module";
import { AboutComponent } from "./about.component";
import { LayoutModule } from "../layout/layout.module";
import { NgModule } from "@angular/core";
import { NgbNavModule } from "@ng-bootstrap/ng-bootstrap";

@NgModule({
  declarations: [AboutComponent],
  imports: [
    CommonModule,
    AboutRoutingModule,
    LayoutModule,
    NgbNavModule
  ]
})
export class AboutModule {}