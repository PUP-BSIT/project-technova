import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  // Clone the request to add the Authorization header if token exists
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // Handle the request and catch any errors
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Unauthorized - token might be expired or invalid
        console.error('Unauthorized request - token expired or invalid');
        authService.logout();
        const loginRoute = authService.getRoleBasedLoginRoute();
        router.navigate([loginRoute], { replaceUrl: true });
      } else if (error.status === 403) {
        // Forbidden - user doesn't have permission
        console.error('Forbidden - insufficient permissions');
      }

      return throwError(() => error);
    })
  );
};