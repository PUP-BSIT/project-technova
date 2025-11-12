import { Component, OnInit } from '@angular/core';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth';

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

  credentials = {
    email: '',
    password: ''
  };
	 errors = { email: '', password: '' };
  infoMessage: string = '';

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

	clearError(field: 'email' | 'password'): void {
		this.errors[field] = '';
    this.infoMessage = '';
	}

  onLogin(): void {
    this.infoMessage = '';
		this.errors = { email: '', password: '' };

    if (!this.credentials.email) {
      this.errors.email = 'Email is required.';
    }
    if (!this.credentials.password) {
      this.errors.password = 'Password is required.';
    }
    if (this.errors.email || this.errors.password) return;

    this.isLoading = true;
    console.log('Login attempt:', this.credentials);

    this.authService.login(this.credentials.email, this.credentials.password).subscribe({
      next: (response) => {
        console.log('Login successful:', response);
        this.isLoading = false;

        const role = response.role; // Get role from backend response

        // Only allow STUDENT role on this login page
        if (role === 'STUDENT') {
          this.router.navigate(['/student-dashboard']);
        } else {
          this.errors.email = `This account is registered as ${role} account. Please use the correct login page.`;
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
					this.errors.password = 'Login failed. Please check your credentials.';
					return;
				}

				if (/email not registered/i.test(backendMsg)) {
					this.errors.email = 'This email is not registered.';
				} else if (/incorrect password/i.test(backendMsg)) {
					this.errors.password = 'Incorrect password. Please try again.';
				} else if (/deactivated/i.test(backendMsg)) {
					this.errors.email = 'This account has been deactivated.';
				} else {
					this.errors.password = backendMsg;
				}
      }
    });
  }

  onForgotPassword(event: Event): void {
    event.preventDefault();
    this.infoMessage = 'Forgot password functionality coming soon!';
  }

  goToDashboard() {
    this.router.navigate(['/student-dashboard/student-dashboard']);
  }

  goToRegister(): void {
    this.router.navigate(['/register'], { queryParams: { role: this.selectedRole } });
  }
}

