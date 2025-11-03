import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Import child components
import { DashboardView } from './dashboard-view/dashboard-view';
import { ManageRequest } from './manage-request/manage-request';
import { Facilities } from './facilities/facilities';
import { Equipment } from './equipment/equipment';
import { ReportLogs } from './report-logs/report-logs';

interface NavItem {
  id: string;
  label: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    DashboardView,
    ManageRequest,
    Facilities,
    Equipment,
    ReportLogs
  ]
})
export class AdminDashboard {
  currentView: string = 'dashboard';

  navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'manage-request', label: 'Manage Request' },
    { id: 'facilities', label: 'Facilities' },
    { id: 'equipment', label: 'Equipment' },
    { id: 'report-logs', label: 'Report and Logs' }
  ];

  setCurrentView(view: string): void {
    this.currentView = view;
  }

  logout(): void {
    console.log('Logging out');
    // Implement logout logic here
  }
}