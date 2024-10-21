import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from "../services/auth.service";
import { Router } from '@angular/router';
import { UrlTree } from '@angular/router';

export const authorizationGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.roles.includes("ADMIN")) {
    return true;
  } else {
    return router.navigateByUrl('/not-authorized');
  }
};
