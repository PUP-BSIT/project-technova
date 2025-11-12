import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth';
import { OrgSidebarComponent } from '../org-sidebar/org-sidebar';
import { Dashboard } from './dashboard/dashboard'; 
import { OrgFacilitiesComponent } from './facilities/facilities';
import { OrgEquipmentComponent } from './equipment/equipment';
import { OrgMyRequestComponent } from './my-request/my-request';
import { OrgMyTransactionComponent } from './my-transaction/my-transaction';

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
    OrgMyRequestComponent,
    OrgMyTransactionComponent
  ],
  templateUrl: './org-dashboard.html',
  styleUrls: ['./org-dashboard.scss']
})
export class OrgDashboardComponent {
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