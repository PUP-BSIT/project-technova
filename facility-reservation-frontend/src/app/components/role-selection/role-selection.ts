import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-role-selection',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './role-selection.html',
  styleUrls: ['./role-selection.scss']
})
export class RoleSelectionComponent {

  constructor(private router: Router) {}

  goToStudent() {
    this.router.navigate(['/login']);
  }

  goToOrganization() {
    this.router.navigate(['/org-login']);
  }
}
