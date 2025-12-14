import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule],
  templateUrl: './admin-login.html',
  styleUrl: './admin-login.scss'
})
export class AdminLogin {
  showPassword = false;
  isLoading = false;
  rememberMe = true; // Default to true
  showForgotPasswordModal = false;
  forgotPasswordEmail = '';
  forgotPasswordLoading = false;
  forgotPasswordSuccess = false;
  forgotPasswordError = '';

  loginForm: FormGroup;

  constructor(
    private router: Router,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.loginForm = this.fb.group({
      email: ['', {
        validators: [Validators.required, Validators.email]
      }],
      password: ['', {
        validators: [Validators.required]
      }]
    });

    this.watchControlChanges();
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  private watchControlChanges(): void {
    ['email', 'password'].forEach((controlName) => {
      const control = this.loginForm.get(controlName);
      control?.valueChanges.subscribe(() => {
        this.clearServerError(controlName as 'email' | 'password');
      });
    });
  }

  private clearServerError(controlName: 'email' | 'password'): void {
    const control = this.loginForm.get(controlName);
    if (!control) {
      return;
    }
    const existingErrors = control.errors;
    if (existingErrors && existingErrors['serverError']) {
      const { serverError, ...rest } = existingErrors;
      const hasOtherErrors = Object.keys(rest).length > 0;
      control.setErrors(hasOtherErrors ? rest : null);
    }
  }

  private setServerError(controlName: 'email' | 'password', message: string): void {
    const control = this.loginForm.get(controlName);
    if (!control) {
      return;
    }
    const existingErrors = control.errors || {};
    control.setErrors({
      ...existingErrors,
      serverError: message
    });
    control.markAsTouched();
  }

  onLogin() {
    this.clearServerError('email');
    this.clearServerError('password');

    this.loginForm.markAllAsTouched();

    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;
    const email = this.loginForm.value.email;
    const password = this.loginForm.value.password;

    this.authService.login(email, password, this.rememberMe).subscribe({
      next: (response) => {
        this.isLoading = false;

        const role = this.authService.getUserRole();
        // Allow ADMINISTRATOR and SUPER_ADMIN (and legacy ADMIN alias)
        if (role === 'ADMINISTRATOR' || role === 'SUPER_ADMIN' || role === 'ADMIN') {
          this.router.navigate(['/admin-dashboard']);
          return;
        } else {
          this.setServerError('email', `Access denied. This login is for administrators only. You are logged in as ${role}.`);
          this.authService.logout();
        }
      },
      error: (error) => {
        console.error('Login error:', error);
        this.isLoading = false;

        let backendMsg = '';
        if (error.error?.message) {
          backendMsg = error.error.message.replace(/^Login failed: /, '');
        } else if (error.message) {
          backendMsg = error.message;
        }

        if (!backendMsg) {
          this.setServerError('password', 'Login failed. Please check your credentials.');
          return;
        }

        if (/email not registered/i.test(backendMsg)) {
          this.setServerError('email', 'This email is not registered.');
        } else if (/incorrect password/i.test(backendMsg)) {
          this.setServerError('password', 'Incorrect password. Please try again.');
        } else if (/deactivated/i.test(backendMsg)) {
          this.setServerError('email', 'This account has been deactivated.');
        } else {
          // default to password error if ambiguous
          this.setServerError('password', backendMsg);
        }
      }
    });
  }

  onForgotPassword(event: Event) {
    event.preventDefault();
    // Pre-fill email from login form if available
    const currentEmail = this.loginForm.get('email')?.value;
    if (currentEmail && !this.loginForm.get('email')?.errors?.['email']) {
      this.forgotPasswordEmail = currentEmail;
    }
    this.showForgotPasswordModal = true;
    this.forgotPasswordSuccess = false;
    this.forgotPasswordError = '';
  }

  closeForgotPasswordModal() {
    this.showForgotPasswordModal = false;
    this.forgotPasswordEmail = '';
    this.forgotPasswordSuccess = false;
    this.forgotPasswordError = '';
    this.forgotPasswordLoading = false;
  }

  submitForgotPassword() {
    // Basic email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!this.forgotPasswordEmail || !emailPattern.test(this.forgotPasswordEmail)) {
      this.forgotPasswordError = 'Please enter a valid email address.';
      return;
    }

    this.forgotPasswordLoading = true;
    this.forgotPasswordError = '';

    this.authService.forgotPassword(this.forgotPasswordEmail).subscribe({
      next: (response) => {
        this.forgotPasswordLoading = false;
        this.forgotPasswordSuccess = true;
      },
      error: (error) => {
        console.error('Forgot password error:', error);
        this.forgotPasswordLoading = false;

        if (error.error?.message) {
          this.forgotPasswordError = error.error.message;
        } else {
          this.forgotPasswordError = 'Failed to send reset email. Please try again.';
        }
      }
    });
  }

  goToRegister() {
    this.router.navigate(['/admin-register']);
  }
}