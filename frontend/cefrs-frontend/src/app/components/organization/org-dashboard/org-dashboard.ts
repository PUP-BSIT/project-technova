import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth';
import { OrgSidebarComponent } from '../org-sidebar/org-sidebar';
import { Dashboard } from './dashboard/dashboard'; 
import { OrgFacilitiesComponent } from './facilities/facilities';
import { OrgEquipmentComponent } from './equipment/equipment';
import { OrgMyRequestComponent } from './my-request/my-request';
@Component({
  selector: 'app-org-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    Dashboard,
    OrgSidebarComponent,
    OrgFacilitiesComponent,
    OrgEquipmentComponent,
    OrgMyRequestComponent
  ],
  templateUrl: './org-dashboard.html',
  styleUrls: ['./org-dashboard.scss']
})
export class OrgDashboardComponent {
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
      this.router.navigate(['/org-profile']);
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