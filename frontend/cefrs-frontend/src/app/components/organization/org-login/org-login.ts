import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-org-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './org-login.html',
  styleUrls: ['./org-login.scss']
})
export class OrgLoginComponent {
  private router = inject(Router);
  private authService = inject(AuthService);

  credentials = { email: '', password: '' };
		errors = { email: '', password: '' };
  showPassword = false;
  isLoading = false;
  errorMessage = '';

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

		clearError(field: 'email' | 'password'): void {
			this.errors[field] = '';
		}

  onLogin(): void {
		this.errorMessage = '';
		this.errors = { email: '', password: '' };

		if (!this.credentials.email) {
			this.errors.email = 'Email is required.';
		}
		if (!this.credentials.password) {
			this.errors.password = 'Password is required.';
		}
		if (this.errors.email || this.errors.password) return;

    this.isLoading = true;
    console.log('Logging in as organization:', this.credentials);

    this.authService.login(this.credentials.email, this.credentials.password).subscribe({
      next: (response) => {
        console.log('Login successful:', response);
        this.isLoading = false;

        const role = this.authService.getUserRole();
        console.log('User role:', role);
        // Redirect to org-dashboard for organization users
        if (role === 'CAMPUS_ORGANIZATION') {
          this.router.navigate(['/org-dashboard']);
        } else if (role === 'STUDENT') {
          // Show error under email field for student accounts
          this.errors.email = 'This email is registered as a student account. Please use the student login page.';
          this.authService.logout();
        } else {
          this.errors.email = `This account is registered as ${role}. Please use the correct login page.`;
          this.authService.logout();
        }
      },
      error: (error) => {
        console.error('Login error:', error);
        this.isLoading = false;

				// Extract error message from backend response and map to fields
				let backendMsg = '';
				if (error.error?.message) {
					backendMsg = error.error.message.replace(/^Login failed: /, '');
				} else if (error.message) {
					backendMsg = error.message;
				}

				// Default/fallback
				if (!backendMsg) {
					this.errors.password = 'Login failed. Please check your credentials.';
					return;
				}

				// Map common backend messages to field errors
				if (/email not registered/i.test(backendMsg)) {
					this.errors.email = 'This email is not registered.';
				} else if (/incorrect password/i.test(backendMsg)) {
					this.errors.password = 'Incorrect password. Please try again.';
				} else if (/deactivated/i.test(backendMsg)) {
					this.errors.email = 'This account is deactivated.';
				} else {
					// If message is ambiguous, show under password by convention
					this.errors.password = backendMsg;
				}
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
