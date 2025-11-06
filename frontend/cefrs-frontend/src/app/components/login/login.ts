import { Component, OnInit } from '@angular/core';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent implements OnInit {

  showPassword: boolean = false;
  selectedRole: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';

  credentials = {
    email: '',
    password: ''
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    // Get role from query params
    this.route.queryParams.subscribe(params => {
      if (params['role']) {
        this.selectedRole = params['role'];
      }
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onLogin(): void {
    this.errorMessage = '';

    if (!this.credentials.email || !this.credentials.password) {
      this.errorMessage = 'Please fill in all fields.';
      return;
    }

    this.isLoading = true;
    console.log('Login attempt:', this.credentials);

    this.authService.login(this.credentials.email, this.credentials.password).subscribe({
      next: (response) => {
        console.log('Login successful:', response);
        this.isLoading = false;

        const role = this.authService.getUserRole();
        // Redirect based on role
        if (role === 'STUDENT' || this.selectedRole.toUpperCase() === 'STUDENT') {
          this.router.navigate(['/student-dashboard']);
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
    this.errorMessage = 'Forgot password functionality coming soon!';
  }

  goToDashboard() {
    this.router.navigate(['/student-dashboard/student-dashboard']);
  }

  goToRegister(): void {
    this.router.navigate(['/register'], { queryParams: { role: this.selectedRole } });
  }
}