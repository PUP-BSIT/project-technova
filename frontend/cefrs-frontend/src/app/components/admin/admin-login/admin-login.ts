import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './admin-login.html',
  styleUrl: './admin-login.scss'
})
export class AdminLogin {
  showPassword = false;
  isLoading = false;

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

    console.log('Logging in as admin:', email);

    this.authService.login(email, password).subscribe({
      next: (response) => {
        console.log('Login successful:', response);
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
    this.setServerError('email', 'Forgot password feature coming soon!');
  }

  goToRegister() {
    this.router.navigate(['/admin-register']);
  }
}