import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-org-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './org-login.html',
  styleUrls: ['./org-login.scss']
})
export class OrgLoginComponent {
  credentials = { email: '', password: '' };
  showPassword: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onLogin(): void {
    this.errorMessage = '';

    if (!this.credentials.email || !this.credentials.password) {
      this.errorMessage = 'Please fill in all fields.';
      return;
    }

    this.isLoading = true;
    console.log('Logging in as organization:', this.credentials);

    this.authService.login(this.credentials.email, this.credentials.password).subscribe({
      next: (response) => {
        console.log('Login successful:', response);
        this.isLoading = false;

        const role = this.authService.getUserRole();
        // Redirect to org-dashboard for organization users
        if (role === 'STUDENT') {
          this.router.navigate(['/org-dashboard']);
        } else {
          this.errorMessage = `Logged in as ${role}. Please use the correct login page.`;
          this.authService.logout();
        }
      },
      error: (error) => {
        console.error('Login error:', error);
        this.isLoading = false;

        const backendMessage = error.error?.message;
        this.errorMessage = backendMessage || 'Login failed. Please check your credentials.';
      }
    });
  }

  onForgotPassword(event: Event): void {
    event.preventDefault();
    this.errorMessage = 'Forgot password feature coming soon!';
  }

  goToRegister(): void {
    this.router.navigate(['/org-register']);
  }
}
