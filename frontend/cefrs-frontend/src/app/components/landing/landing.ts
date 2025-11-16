import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './landing.html',
  styleUrls: ['./landing.scss']
})
export class LandingComponent {
  constructor(private router: Router) {}

  goToRoleSelection() {
    this.router.navigate(['/role-selection']);
  }

  goToStudentLogin() {
    this.router.navigate(['/login'], { queryParams: { role: 'STUDENT' } });
  }

  goToOrgLogin() {
    this.router.navigate(['/org-login']);
  }

  goToAdminLogin() {
    this.router.navigate(['/admin-login']);
  }
}

