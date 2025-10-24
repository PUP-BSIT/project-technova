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
      console.log('Access denied - redirecting to login');
      this.router.navigate(['/login']);
      return false;
    }

    // 2. Role-Based Redirection Check (Only runs if logged in)
    const userRole = this.authService.getUserRole();

    // Check if the user is a STUDENT and the current URL is '/dashboard' (the overall one)
    if (userRole === 'STUDENT' && state.url === '/dashboard') {
      console.log('STUDENT detected. Redirecting to student-dashboard.');
      this.router.navigate(['/student-dashboard']);
      return false; // Stop navigation to the overall dashboard
    }

    // For all other cases (Admin on /dashboard, Student on /student-dashboard), this grant access.
    console.log(`Access granted for role ${userRole} to:`, state.url);
    return true;
  }
}
