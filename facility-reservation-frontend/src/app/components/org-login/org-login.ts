import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-org-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './org-login.html',
  styleUrls: ['./org-login.scss']
})
export class OrgLoginComponent {
  credentials = { email: '', password: '' };

  constructor(private router: Router) {}

  onLogin(): void {
    if (!this.credentials.email || !this.credentials.password) {
      alert('Please fill in all fields');
      return;
    }
    console.log('Logging in as organization:', this.credentials);
    this.router.navigate(['/dashboard']);
  }

  onForgotPassword(event: Event): void {
    event.preventDefault();
    alert('Forgot password feature coming soon!');
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }
}