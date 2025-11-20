import { Component, HostListener } from '@angular/core';
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
  isSidebarOpen = true;
  isMobileView = false;
  private readonly DESKTOP_BREAKPOINT = 1024;
  private initialized = false;

  constructor(private router: Router) {
    this.evaluateViewport();
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.evaluateViewport();
  }

  setView(view: 'dashboard' | 'facilities' | 'equipment' | 'requests' | 'transactions' | 'settings'): void {
    this.currentView = view;

    if (view === 'settings') {
      this.router.navigate(['/student-dashboard/settings/profile']);
    }
  }

  onSidebarViewChange(view: string): void {
    this.setView(view as 'dashboard' | 'facilities' | 'equipment' | 'requests' | 'transactions' | 'settings');
    if (this.isMobileView) {
      this.isSidebarOpen = false;
    }
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar(): void {
    if (this.isSidebarOpen) {
      this.isSidebarOpen = false;
    }
  }

  private evaluateViewport(): void {
    if (typeof window === 'undefined') {
      return;
    }

    const previousMobileState = this.isMobileView;
    const nextMobileState = window.innerWidth < this.DESKTOP_BREAKPOINT;
    this.isMobileView = nextMobileState;

    if (!nextMobileState && previousMobileState) {
      this.isSidebarOpen = true;
    }

    if (!this.initialized) {
      this.isSidebarOpen = !this.isMobileView;
      this.initialized = true;
    }
  }
}