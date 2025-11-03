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
  errorMessage = '';

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
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onLogin() {
    this.errorMessage = '';
    
    this.loginForm.markAllAsTouched();

    if (this.loginForm.invalid) {
      this.errorMessage = 'Please fill in all fields correctly.';
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
        // Only allow ADMIN role users
        if (role === 'ADMIN') {
          this.router.navigate(['/dashboard']);
        } else {
          this.errorMessage = `Access denied. This login is for administrators only. You are logged in as ${role}.`;
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

  onForgotPassword(event: Event) {
    event.preventDefault();
    this.errorMessage = 'Forgot password feature coming soon!';
  }
}