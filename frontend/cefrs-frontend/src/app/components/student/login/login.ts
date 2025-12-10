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
  
  // Validation flags
  showEmailError = false;

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
    if (field === 'email') {
      this.showEmailError = false;
    }
	}
  
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  isValidStudentId(studentId: string): boolean {
    // Student ID format: YYYY-XXXXX-XX-X (e.g., 2023-00439-TG-0)
    // Accepts both uppercase and lowercase letters
    const studentIdRegex = /^\d{4}-\d{5}-[A-Za-z]{2}-\d$/;
    return studentIdRegex.test(studentId);
  }
  
  isEmailOrStudentId(input: string): 'email' | 'studentId' | 'invalid' {
    if (this.isValidEmail(input)) {
      return 'email';
    } else if (this.isValidStudentId(input)) {
      return 'studentId';
    }
    return 'invalid';
  }

  onLogin(): void {
    this.infoMessage = '';
		this.errors = { email: '', password: '' };
    this.showEmailError = false;

    // Validate email/student ID field
    if (!this.credentials.email || !this.credentials.email.trim()) {
      this.errors.email = 'Email Address or Student ID is required.';
      this.showEmailError = true;
    } else {
      const inputType = this.isEmailOrStudentId(this.credentials.email.trim());
      if (inputType === 'invalid') {
        this.errors.email = 'Please enter a valid email address (e.g., example@gmail.com) or Student ID (e.g., 2023-00439-TG-0).';
        this.showEmailError = true;
      }
    }
    
    // Validate password
    if (!this.credentials.password || !this.credentials.password.trim()) {
      this.errors.password = 'Password is required.';
    }
    
    if (this.errors.email || this.errors.password) return;

    this.isLoading = true;
    console.log('Login attempt:', this.credentials);

    this.authService.login(this.credentials.email, this.credentials.password).subscribe({
      next: (response) => {
        console.log('Login successful:', response);
        this.isLoading = false;

        // Get role from localStorage (stored by AuthService after successful login)
        const role = this.authService.getUserRole();
        console.log('User role:', role);

        // Only allow STUDENT role on this login page
        if (role === 'STUDENT') {
          this.router.navigate(['/student-dashboard']);
        } else {
          this.errors.email = `This account is registered as ${role} account. Please use the correct login page.`;
          this.showEmailError = true;
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

				if (/email.*not registered|student id.*not registered/i.test(backendMsg)) {
					this.errors.email = 'This email address or Student ID is not registered.';
					this.showEmailError = true;
				} else if (/incorrect password/i.test(backendMsg)) {
					this.errors.password = 'Incorrect password. Please try again.';
				} else if (/deactivated/i.test(backendMsg)) {
					this.errors.email = 'This account has been deactivated.';
					this.showEmailError = true;
				} else {
					this.errors.password = backendMsg;
				}
      }
    });
  }

  onForgotPassword(event: Event): void {
    event.preventDefault();
    this.router.navigate(['/forgot-password']);
  }

  goToDashboard() {
    this.router.navigate(['/student-dashboard/student-dashboard']);
  }

  goToRegister(): void {
    this.router.navigate(['/register'], { queryParams: { role: this.selectedRole } });
  }

  goToLanding(): void {
    this.router.navigate(['/']);
  }

  goToPreviousPage(): void {
    window.history.back();
  }
}

