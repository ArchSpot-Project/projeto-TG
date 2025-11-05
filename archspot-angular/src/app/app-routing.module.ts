import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePageComponent } from './home/pages/home-page/home-page.component';
import { ProjectsPageComponent } from './projects/pages/projects-page/projects-page.component';
import { ProjectDetailsPageComponent } from './projects/pages/project-details-page/project-details-page.component';
import { LoginPageComponent } from './auth/pages/login-page/login-page.component';
import { projectAccessGuard } from './core/guards/project-access.guard';
import { authGuard } from './core/guards/auth.guard';
import { ContactsComponent } from './contacts/contacts.component';
import { AboutComponent } from './about/about.component';
import { ProfilePageComponent } from './profile/pages/profile-page/profile-page.component';
import { ReportsPageComponent } from './reports/pages/reports-page/reports-page.component';
import { ScheduleComponent } from './schedule/schedule.component';
import { DrawingsComponent } from './drawings/drawings.component';
import { UsersProjectPageComponent } from './users-project/pages/users-project-page/users-project-page.component';
import { PaymentsComponent } from './payments/payments.component';
import { DocumentsComponent } from './documents/documents.component';
import { LandingPageComponent } from './public/pages/landing-page/landing-page.component';
import { DocumentViewComponent } from './documents/document-view/document-view.component';
import { AlbunsComponent } from './albuns/albuns.component';
import { PhotosComponent } from './albuns/photos/photos.component';

const routes: Routes = [
  { path: '', component: LandingPageComponent },
  { path: 'login', component: LoginPageComponent },

  // rotas globais protegidas
  { path: 'home', component: HomePageComponent, canActivate: [authGuard] },
  { path: 'contacts', component: ContactsComponent, canActivate: [authGuard] },
  { path: 'about', component: AboutComponent, canActivate: [authGuard] },
  { path: 'profile', component: ProfilePageComponent, canActivate: [authGuard] },
  { path: 'reports', component: ReportsPageComponent, canActivate: [authGuard] },
  { path: 'projects', component: ProjectsPageComponent, canActivate: [authGuard] },

  // rotas de projeto
  { path: 'projects/:id', component: ProjectDetailsPageComponent, canActivate: [authGuard, projectAccessGuard] },
  { path: 'projects/:id/schedule', component: ScheduleComponent, canActivate: [authGuard, projectAccessGuard] },
  { path: 'projects/:id/payments', component: PaymentsComponent, canActivate: [authGuard, projectAccessGuard] },
  { path: 'projects/:id/users-project', component: UsersProjectPageComponent, canActivate: [authGuard, projectAccessGuard] },
  { path: 'projects/:id/albuns', component: AlbunsComponent, canActivate: [authGuard, projectAccessGuard] },
  { path: 'projects/:id/albuns/:albumId', component: PhotosComponent, canActivate: [authGuard, projectAccessGuard] },
  { path: 'projects/:id/documents', component: DocumentsComponent, canActivate: [authGuard, projectAccessGuard] },
  { path: 'projects/:id/documents/:documentId/view', component: DocumentViewComponent, canActivate: [authGuard, projectAccessGuard] },
  { path: 'projects/:id/drawings', component: DrawingsComponent, canActivate: [authGuard, projectAccessGuard] },
  { path: 'projects/:id/drawings/:drawingId/view', component: DocumentViewComponent, canActivate: [authGuard, projectAccessGuard] },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
