import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth';
import { OrgSidebarComponent } from '../org-sidebar/org-sidebar';
import { OrgFacilitiesComponent } from './facilities/facilities';
import { OrgEquipmentComponent } from './equipment/equipment';
import { OrgMyRequestComponent } from './my-request/my-request';
import { OrgMyTransactionComponent } from './my-transaction/my-transaction';

// --- INTERFACES ---
interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: string;
  organizationName: string;
  isActive: boolean;
}

interface Request {
  id: string;
  title: string;
  type: 'Equipment' | 'Facility';
  status: 'Pending' | 'Approved' | 'Rejected' | 'Returned';
  quantity?: number;
  requestDate: string;
  returnDate?: string;
  dayOfEvent?: string;
  adminNotes: string;
}

@Component({
  selector: 'app-org-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    OrgSidebarComponent,
    OrgFacilitiesComponent,
    OrgEquipmentComponent,
    OrgMyRequestComponent,
    OrgMyTransactionComponent
  ],
  templateUrl: './org-dashboard.html',
  styleUrls: ['./org-dashboard.scss']
})
export class OrgDashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  currentView: 'dashboard' | 'facilities' | 'equipment' | 'requests' | 'transactions' | 'settings' = 'dashboard';
  user: User | null = null;

  stats = {
    activeReservations: 3,
    borrowedEquipment: 10,
    pendingRequests: 2,
    totalRequests: 10
  };

  recentRequests: Request[] = [
    { id: 'R1045', title: 'Conference Room', type: 'Facility', status: 'Approved', requestDate: '10/1/2025', adminNotes: 'Approved for testing purposes' },
    { id: 'R1046', title: 'Microphone', type: 'Equipment', status: 'Pending', quantity: 2, requestDate: '10/1/2025', returnDate: '10/4/2025', adminNotes: 'Pending stock check' },
    { id: 'R1047', title: 'Speaker', type: 'Equipment', status: 'Rejected', quantity: 1, requestDate: '10/1/2025', returnDate: '10/4/2025', adminNotes: 'Facility is booked on requested date' }
  ];

  ngOnInit(): void {
    this.fetchUserProfile();
  }

  fetchUserProfile(): void {
    this.authService.getUserProfile().subscribe({
      next: (profile) => {
        console.log('Fetched user profile:', profile);
        console.log('Organization Name:', profile.organizationName);
        this.user = profile;
        if (!this.user.organizationName) {
          console.warn('Organization name is missing from profile!');
        }
      },
      error: (err) => {
        console.error('Error fetching user profile:', err);
        this.user = {
          id: 0,
          email: 'guest@example.com',
          firstName: 'Welcome',
          lastName: 'Guest',
          phoneNumber: '',
          role: 'Guest',
          organizationName: 'Guest Organization',
          isActive: false
        };
      }
    });
  }

  setView(view: 'dashboard' | 'facilities' | 'equipment' | 'requests' | 'transactions' | 'settings'): void {
    this.currentView = view;

    // ✅ Route to org profile when settings is clicked
    if (view === 'settings') {
      this.router.navigate(['/org-profile']);
    }
  }

  onSidebarViewChange(view: string): void {
    this.setView(view as 'dashboard' | 'facilities' | 'equipment' | 'requests' | 'transactions' | 'settings');
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      Approved: 'status-approved',
      Pending: 'status-pending',
      Rejected: 'status-rejected',
      Returned: 'status-returned'
    };
    return map[status] || '';
  }
}