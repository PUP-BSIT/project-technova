import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth';

// Import child components
import { DashboardView } from './dashboard-view/dashboard-view';
import { ManageRequest } from './manage-request/manage-request';
import { Facilities } from './facilities/facilities';
import { Equipment } from './equipment/equipment';
import { ReportLogs } from './report-logs/report-logs';

import { CalendarView } from '../admin-dashboard/calendar/calendar-view/calendar-view';

interface NavItem {
  id: string;
  label: string;
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
    CalendarView
  ]
})
export class AdminDashboard {
  currentView: string = 'dashboard';
  constructor(private router: Router, private authService: AuthService) { }

  navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'manage-request', label: 'Manage Request' },
    { id: 'calendar', label: 'Calendar' },
    { id: 'facilities', label: 'Facilities' },
    { id: 'equipment', label: 'Equipment' },
    { id: 'report-logs', label: 'Report and Logs' },
    { id: 'settings', label: 'Settings' }
  ];

  setCurrentView(view: string): void {
    this.currentView = view;
    if (view === 'settings') {
      this.router.navigate(['/admin-dashboard/settings/profile']);
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/admin-login']);
  }
}