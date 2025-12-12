import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    // 1. Authentication Check
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return false;
    }

    // 2. Role-Based Redirection Check (Only runs if logged in)
    const userRole = this.authService.getUserRole();

    // Redirect based on role to appropriate dashboard
    if (userRole === 'STUDENT' && state.url === '/dashboard') {
      this.router.navigate(['/student-dashboard']);
      return false;
    } else if (userRole === 'CAMPUS_ORGANIZATION' && state.url === '/dashboard') {
      this.router.navigate(['/org-dashboard']);
      return false;
    } else if ((userRole === 'ADMIN' || userRole === 'ADMINISTRATOR' || userRole === 'SUPER_ADMIN') && state.url === '/dashboard') {
      this.router.navigate(['/admin-dashboard']);
      return false;
    }

    // For all other cases, grant access.
    return true;
  }
}
