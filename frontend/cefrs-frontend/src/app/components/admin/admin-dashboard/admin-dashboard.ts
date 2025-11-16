import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
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

  currentView: string = 'dashboard';
  user: any = null;
  isLoading = true;

  navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'assets/dashboard.png' },
    { id: 'manage-request', label: 'Manage Request', icon: 'assets/manage.png' },
    { id: 'calendar', label: 'Calendar', icon: 'assets/calendar.png' },
    { id: 'facilities', label: 'Facilities', icon: 'assets/facilities.png' },
    { id: 'equipment', label: 'Equipment', icon: 'assets/equipment.png' },
    { id: 'equipment-inventory', label: 'Equipment Inventory', icon: 'assets/inventory.png' },
    { id: 'report-logs', label: 'Report and Logs', icon: 'assets/report.png' },
    { id: 'settings', label: 'Settings', icon: 'assets/settings.png' }
  ];

  ngOnInit(): void {
    this.loadUserProfile();
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
    if (view === 'settings') {
      this.router.navigate(['/admin-dashboard/settings/profile']);
    }
  }

  logout(): void {
    // Clear all authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    sessionStorage.clear();
    
    // Reset user data
    this.user = null;
    
    // Use authService logout
    this.authService.logout();
    this.router.navigate(['/admin-login']);
  }
}