import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { of } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.getUser();

  if (!user) {
    alert('Usuário não logado. Faça o login para acessar');
    return of(router.createUrlTree(['/login']));
  }

  return of(true);
};
