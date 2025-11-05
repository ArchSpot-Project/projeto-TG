import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ProjectService } from '../services/project.service';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export const projectAccessGuard: CanActivateFn = (route, state) => {
  const projectService = inject(ProjectService);
  const authService = inject(AuthService);
  const router = inject(Router);

  const projectId = Number(route.paramMap.get('id'));
  const user = authService.getUser();

  if (!user) {
    alert('Usuário não logado. Faça o login para acessar');
    return of(router.createUrlTree(['/login']));
  }

  return projectService.userHasAccess(projectId, user.id).pipe(
    map(hasAccess => {
      if (!hasAccess) {
        alert('Usuário não pertence a esse projeto.');
        return router.createUrlTree(['/home']);
      }
      return true;
    }),
    catchError(() => {
      alert('Usuário não pertence a esse projeto.');
      return of(router.createUrlTree(['/home']));
    })
  );
};
