import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { StudentSidebarComponent } from '../student-sidebar/student-sidebar';
import { Dashboard } from './dashboard/dashboard';
import { Facilities } from './facilities/facilities';
import { Equipment } from './equipment/equipment';
import { MyRequests } from './my-requests/my-requests';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    StudentSidebarComponent,
    Dashboard,
    Facilities,
    Equipment,
    MyRequests
  ],
  templateUrl: './student-dashboard.html',
  styleUrls: ['./student-dashboard.scss']
})
export class StudentDashboard {
  currentView: 'dashboard' | 'facilities' | 'equipment' | 'requests' | 'transactions' | 'settings' = 'dashboard';

  constructor(private router: Router) {}

  setView(view: 'dashboard' | 'facilities' | 'equipment' | 'requests' | 'transactions' | 'settings'): void {
    this.currentView = view;

    if (view === 'settings') {
      this.router.navigate(['/student-dashboard/settings/profile']);
    }
  }

  onSidebarViewChange(view: string): void {
    this.setView(view as 'dashboard' | 'facilities' | 'equipment' | 'requests' | 'transactions' | 'settings');
  }
}