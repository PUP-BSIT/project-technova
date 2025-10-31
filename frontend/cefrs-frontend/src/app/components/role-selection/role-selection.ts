import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-role-selection',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './role-selection.html',
  styleUrls: ['./role-selection.scss']
})
export class RoleSelectionComponent {

  constructor(private router: Router) { }

  goToStudentAuth() {
    this.router.navigate(['/login'], { queryParams: { role: 'STUDENT' } });
  }

  goToOrganizationAuth() {
    this.router.navigate(['/org-login']);
  }
}