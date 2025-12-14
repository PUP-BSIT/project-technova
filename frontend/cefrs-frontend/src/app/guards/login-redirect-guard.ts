import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth';

@Injectable({
  providedIn: 'root'
})
export class LoginRedirectGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  canActivate(): boolean {
    // If user is already logged in, redirect to appropriate dashboard
    if (this.authService.isLoggedIn()) {
      const role = this.authService.getUserRole();
      console.log('🔄 LoginRedirectGuard: User already logged in as', role, '- redirecting to dashboard');

      // Redirect based on role
      if (role === 'STUDENT') {
        this.router.navigate(['/student-dashboard']);
      } else if (role === 'CAMPUS_ORGANIZATION') {
        this.router.navigate(['/org-dashboard']);
      } else if (role === 'ADMIN' || role === 'ADMINISTRATOR' || role === 'SUPER_ADMIN') {
        this.router.navigate(['/admin-dashboard']);
      } else {
        // Fallback for unknown roles
        this.router.navigate(['/']);
      }

      return false; // Prevent access to login page
    }

    // User is not logged in, allow access to login page
    console.log('✅ LoginRedirectGuard: User not logged in - showing login page');
    return true;
  }
}