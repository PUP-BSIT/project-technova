import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
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
  
  credentials = {
    email: '',
    password: ''
  };
  
  constructor(private router: Router) {}
  
  ngOnInit(): void {
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
    this.router.navigate(['/register']);
  }
  
  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}