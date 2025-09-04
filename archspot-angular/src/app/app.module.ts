import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AuthModule } from './auth/auth.module';
import { CoreModule } from './core/core.module';
import { HomeModule } from './home/home.module';
import { LayoutModule } from './layout/layout.module';
import { MaintenanceModule } from './maintenance/maintenance.module';
import { SharedModule } from './shared/shared.module';
import { PublicModule } from './public/public.module';
import { HttpClientModule } from '@angular/common/http';
import { ProjectsModule } from './projects/projects.module';
import { EventsModule } from './events/events.module';
import { ReportsModule } from './reports/reports.module';
import { ProfileModule } from './profile/profile.module';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,

    AuthModule,
    CoreModule,
    HomeModule,
    ProjectsModule,
    EventsModule,
    ReportsModule,
    ProfileModule,
    MaintenanceModule,

    PublicModule,
    LayoutModule,
    SharedModule,


    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
