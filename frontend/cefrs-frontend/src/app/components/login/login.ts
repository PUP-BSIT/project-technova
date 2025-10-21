import { Component, OnInit } from '@angular/core';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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

  credentials = {
    email: '',
    password: ''
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute
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
    if (!this.credentials.email || !this.credentials.password) {
      alert('Please fill in all fields');
      return;
    }

    console.log('Login attempt:', this.credentials);

    // Navigate to dashboard after login
    this.goToDashboard();
  }

  onForgotPassword(event: Event): void {
    event.preventDefault();
    alert('Forgot password functionality coming soon!');
  }

  goToRegister(): void {
    // Updated to pass role to register page
    this.router.navigate(['/register'], { queryParams: { role: this.selectedRole } });
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}