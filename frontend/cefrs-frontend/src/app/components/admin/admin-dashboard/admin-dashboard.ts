import { Component, OnInit, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { AuthService } from '../../../services/auth';
import { ProfileService } from '../../../services/profile.service';

// Import child components
import { DashboardView } from './dashboard-view/dashboard-view';
import { ManageRequest } from './manage-request/manage-request';
import { Facilities } from './facilities/facilities';
import { Equipment } from './equipment/equipment';
import { ReportLogs } from './report-logs/report-logs';

import { CalendarView } from '../admin-dashboard/calendar/calendar-view/calendar-view';
import { EquipmentInventory } from '../equipment-inventory/equipment-inventory';

interface NavItem {
  id: string;
  label: string;
  icon: string;
  title: string; // Add title property for tab names
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    DashboardView,
    ManageRequest,
    Facilities,
    Equipment,
    ReportLogs,
    CalendarView,
    EquipmentInventory
  ]
})
export class AdminDashboard implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);
  private profileService = inject(ProfileService);
  private titleService = inject(Title);

  currentView: string = 'dashboard';
  user: any = null;
  isLoading = true;
  showLogoutModal: boolean = false;

  // Filter state for manage-request view
  manageRequestStatus: string = '';
  manageRequestType: string = '';

  showNotificationModal: boolean = false;
  notificationType: 'success' | 'error' = 'success';
  notificationMessage: string = '';

  // Mobile responsive properties
  isMobileView: boolean = false;
  sidenavOpen: boolean = false;
  isCollapsed: boolean = false; // Desktop collapse state

  navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'assets/dashboard.png', title: 'Admin Dashboard' },
    { id: 'manage-request', label: 'Manage Request', icon: 'assets/manage.png', title: 'Admin Manage Request' },
    { id: 'calendar', label: 'Calendar', icon: 'assets/calendar.png', title: 'Admin Calendar' },
    { id: 'facilities', label: 'Facilities', icon: 'assets/facilities.png', title: 'Admin Facilities' },
    { id: 'equipment', label: 'Equipment', icon: 'assets/equipment.png', title: 'Admin Equipment' },
    { id: 'equipment-inventory', label: 'Equipment Inventory', icon: 'assets/inventory.png', title: 'Admin Equipment Inventory' },
    { id: 'report-logs', label: 'Report and Logs', icon: 'assets/report.png', title: 'Admin Report and Logs' },
    { id: 'settings', label: 'Settings', icon: 'assets/settings.png', title: 'Admin Settings' }
  ];

  ngOnInit(): void {
    this.loadUserProfile();
    this.checkScreenSize();
    // Set initial tab title
    this.updateTabTitle('dashboard');
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
  }

  private checkScreenSize(): void {
    this.isMobileView = window.innerWidth < 1024; // Below 1024px is considered mobile/tablet
    if (!this.isMobileView) {
      this.sidenavOpen = false; // Close sidenav when switching to desktop
    }
  }

  toggleCollapse(): void {
    // Only allow collapse on desktop
    if (!this.isMobileView) {
      // Toggle between expanded and collapsed (icons only) states
      // Sidebar stays open, just changes width
      this.isCollapsed = !this.isCollapsed;
    }
  }

  get isDesktop(): boolean {
    return !this.isMobileView;
  }

  toggleSidenav(): void {
    this.sidenavOpen = !this.sidenavOpen;
  }

  closeSidenav(): void {
    if (this.isMobileView) {
      this.sidenavOpen = false;
    }
  }

  private loadUserProfile(): void {
    this.isLoading = true;
    this.profileService.getProfile().subscribe({
      next: (data: any) => {
        this.isLoading = false;
        let displayName: string;
        displayName = data.firstName && data.lastName
          ? `${data.firstName} ${data.lastName}`
          : data.email || 'Admin';

        this.user = {
          name: displayName,
          email: data.email || 'admin@example.com'
        };
      },
      error: (err) => {
        console.error('Error loading user profile for sidebar:', err);
        this.isLoading = false;
        this.user = {
          name: 'Admin',
          email: 'admin@example.com'
        };
      }
    });
  }

  setCurrentView(view: string): void {
    this.currentView = view;
    this.updateTabTitle(view);
    if (view === 'settings') {
      this.router.navigate(['/admin-dashboard/settings/profile']);
    }
    this.closeSidenav(); // Close sidenav after navigation on mobile
  }

  private updateTabTitle(viewId: string): void {
    const navItem = this.navItems.find(item => item.id === viewId);
    if (navItem) {
      this.titleService.setTitle(navItem.title);
    }
  }

  onViewAllRequested(): void {
    this.manageRequestStatus = '';
    this.manageRequestType = '';
    this.setCurrentView('manage-request');
  }

  onNavigateToManageRequest(filters: { status?: string; type?: string }): void {
    this.manageRequestStatus = filters.status || '';
    this.manageRequestType = filters.type || '';
    this.setCurrentView('manage-request');
  }

  logout(): void {
    this.showLogoutModal = true;
  }

  confirmLogout(): void {
    this.authService.logout();
    this.router.navigate(['/admin-login']);
    this.showLogoutModal = false;
  }

  closeLogoutModal(): void {
    this.showLogoutModal = false;
  }

  showSuccess(message: string): void {
    this.notificationType = 'success';
    this.notificationMessage = message;
    this.showNotificationModal = true;

    setTimeout(() => {
      this.showNotificationModal = false;
    }, 3000);
  }

  showError(message: string): void {
    this.notificationType = 'error';
    this.notificationMessage = message;
    this.showNotificationModal = true;

    setTimeout(() => {
      this.showNotificationModal = false;
    }, 5000);
  }

  closeNotificationModal(): void {
    this.showNotificationModal = false;
  }

  handleMessage(event: { type: 'success' | 'error', message: string }): void {
    if (event.type === 'success') {
      this.showSuccess(event.message);
    } else {
      this.showError(event.message);
    }
  }
}