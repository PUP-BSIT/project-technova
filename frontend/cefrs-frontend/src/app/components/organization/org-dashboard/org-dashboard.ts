import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
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
    MatSidenavModule,
    MatButtonModule,
    MatIconModule,
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
  @ViewChild('sidenav') sidenav!: MatSidenav;
  @ViewChild(OrgSidebarComponent) sidebarComponent!: OrgSidebarComponent;
  
  currentView: 'dashboard' | 'facilities' | 'equipment' | 'requests' | 'transactions' | 'settings' = 'dashboard';
  isSidebarOpen = true;

  constructor(private router: Router) {}

  setView(view: 'dashboard' | 'facilities' | 'equipment' | 'requests' | 'transactions' | 'settings'): void {
    this.currentView = view;

    if (view === 'settings') {
      this.router.navigate(['/org-profile']);
    }
  }

  onSidebarViewChange(view: string): void {
    this.setView(view as 'dashboard' | 'facilities' | 'equipment' | 'requests' | 'transactions' | 'settings');
  }

  toggleSidebar(): void {
    if (this.sidebarComponent) {
      this.sidebarComponent.toggleSidebar();
    }
  }

  get isMobileView(): boolean {
    return this.sidebarComponent?.isMobileView || false;
  }
}