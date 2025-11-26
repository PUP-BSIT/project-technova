import { Component, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
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
    MatSidenavModule,
    MatButtonModule,
    MatIconModule,
    StudentSidebarComponent,
    Dashboard,
    Facilities,
    Equipment,
    MyRequests
  ],
  templateUrl: './student-dashboard.html',
  styleUrls: ['./student-dashboard.scss']
})
export class StudentDashboard implements AfterViewInit {
  @ViewChild('sidenav') sidenav!: MatSidenav;
  @ViewChild(StudentSidebarComponent) sidebarComponent!: StudentSidebarComponent;
  
  currentView: 'dashboard' | 'facilities' | 'equipment' | 'requests' | 'transactions' | 'settings' = 'dashboard';
  isSidebarOpen = true;
  isMobileView = false;

  constructor(private router: Router, private cdr: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    // Initialize isMobileView after view is initialized
    if (this.sidebarComponent) {
      this.isMobileView = this.sidebarComponent.isMobileView;
      this.cdr.detectChanges();
    }
  }

  setView(view: 'dashboard' | 'facilities' | 'equipment' | 'requests' | 'transactions' | 'settings'): void {
    this.currentView = view;

    if (view === 'settings') {
      this.router.navigate(['/student-dashboard/settings/profile']);
    }
  }

  onSidebarViewChange(view: string): void {
    this.setView(view as 'dashboard' | 'facilities' | 'equipment' | 'requests' | 'transactions' | 'settings');
  }

  toggleSidebar(): void {
    if (this.sidebarComponent) {
      this.sidebarComponent.toggleSidebar();
      // Update isMobileView after toggle
      this.isMobileView = this.sidebarComponent.isMobileView;
    }
  }
}