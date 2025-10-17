import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  template: `
    <div style="padding: 20px;">
      <h1>Dashboard Works!</h1>
      <p>If you see this, routing is working.</p>
      <button (click)="goToLogin()">Go to Login</button>
    </div>
  `,
  styles: [`
    div {
      font-family: Arial, sans-serif;
    }
    button {
      padding: 10px 20px;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
  `]
})
export class DashboardComponent implements OnInit {
  constructor(private router: Router) { }

  ngOnInit(): void {
    console.log('Dashboard loaded!');
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}