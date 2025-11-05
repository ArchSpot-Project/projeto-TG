import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AuthModule } from './auth/auth.module';
import { CoreModule } from './core/core.module';
import { HomeModule } from './home/home.module';
import { LayoutModule } from './layout/layout.module';
import { UsersProjectModule } from './users-project/users-project.module';
import { SharedModule } from './shared/shared.module';
import { PublicModule } from './public/public.module';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { ProjectsModule } from './projects/projects.module';
import { ReportsModule } from './reports/reports.module';
import { ProfileModule } from './profile/profile.module';
import { DrawingsModule } from './drawings/drawings.module';
import { DocumentsModule } from './documents/documents.module';
import { PaymentsModule } from './payments/payments.module';
import { ScheduleModule } from './schedule/schedule.module';
import { ContactsModule } from './contacts/contacts.module';
import { AboutModule } from './about/about.module';
import { AlbunsModule } from './albuns/albuns.module';
import { AuthInterceptor } from './core/services/auth.interceptor';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    DrawingsModule,
    DocumentsModule,
    PaymentsModule,
    ScheduleModule,
    AuthModule,
    AboutModule,
    AlbunsModule,
    CoreModule,
    HomeModule,
    ProjectsModule,
    ReportsModule,
    ProfileModule,
    UsersProjectModule,
    PublicModule,
    LayoutModule,
    SharedModule,
    HttpClientModule,
    ContactsModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
