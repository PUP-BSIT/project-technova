import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth';
import { AuditLogService, AuditLog } from '../../../services/audit-log.service';
import { EquipmentService } from '../../../services/equipment.service';
import { FacilityService } from '../../../services/facility.service';
import { SidebarComponent } from '../../sidebar/sidebar';

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
  name?: string;
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

interface Facility {
  id: number;
  name: string;
  location: string;
  description: string;
  capacity: number;
  imageUrl: string;
  status: string;
}

interface Equipment {
  id: number;
  name: string;
  description: string;
  category: string;
  quantityAvailable: number;
  quantityTotal: number;
  imageUrl: string;
  status: string;
}

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SidebarComponent],
  templateUrl: './student-dashboard.html',
  styleUrls: ['./student-dashboard.scss']
})
export class StudentDashboard implements OnInit {
  private authService = inject(AuthService);
  private auditLogService = inject(AuditLogService);
  private equipmentService = inject(EquipmentService);
  private facilityService = inject(FacilityService);
  private router = inject(Router);

  currentView: 'dashboard' | 'facilities' | 'equipment' | 'requests' | 'transactions' | 'settings' = 'dashboard';
  user: User | null = null;

  auditLogs: AuditLog[] = [];
  isLoadingLogs = false;
  isLoadingEquipment = false;
  isLoadingFacilities = false;

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

  facilities: Facility[] = [];
  equipment: Equipment[] = [];

  allRequests: Request[] = [
    { id: 'R1045', title: 'Microphone', type: 'Equipment', status: 'Pending', quantity: 2, requestDate: '10/1/2025', returnDate: '10/4/2025', adminNotes: 'Pending stock check' },
    { id: 'R1046', title: '4th Floor, Engr. AVR', type: 'Facility', status: 'Approved', requestDate: '10/1/2025', dayOfEvent: '10/4/2025', adminNotes: 'Confirmed for 8:00 AM - 12:00 PM' },
    { id: 'R1047', title: 'Speaker', type: 'Equipment', status: 'Returned', quantity: 1, requestDate: '10/1/2025', returnDate: '10/4/2025', adminNotes: 'Item returned in good condition' }
  ];

  searchQuery = '';
  selectedCategory = 'All Categories';
  selectedStatus = 'All Status';
  selectedType = 'All Types';

  ngOnInit(): void {
    this.fetchUserProfile();
    this.fetchAuditLogs();
    this.fetchEquipment();
    this.fetchFacilities();
  }

  fetchEquipment(): void {
    this.isLoadingEquipment = true;
    this.equipmentService.getAvailableEquipment().subscribe({
      next: (response) => {
        this.equipment = response.data;
        this.isLoadingEquipment = false;
        console.log('Equipment loaded:', this.equipment);
      },
      error: (err) => {
        console.error('Error fetching equipment:', err);
        this.isLoadingEquipment = false;
        // Keep empty array or show error message
      }
    });
  }

  fetchFacilities(): void {
    this.isLoadingFacilities = true;
    this.facilityService.getAvailableFacilities().subscribe({
      next: (response) => {
        this.facilities = response.data;
        this.isLoadingFacilities = false;
        console.log('Facilities loaded:', this.facilities);
      },
      error: (err) => {
        console.error('Error fetching facilities:', err);
        this.isLoadingFacilities = false;
        // Keep empty array or show error message
      }
    });
  }

  fetchAuditLogs(): void {
    this.isLoadingLogs = true;
    this.auditLogService.getMyAuditLogs().subscribe({
      next: (logs) => {
        this.auditLogs = logs;
        this.isLoadingLogs = false;
      },
      error: (err) => {
        console.error('Error fetching audit logs:', err);
        this.isLoadingLogs = false;
      }
    });
  }

  fetchUserProfile(): void {
    this.authService.getUserProfile().subscribe({
      next: (profile) => {
        this.user = profile;
        this.user.name = `${profile.firstName} ${profile.lastName}`;
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
          organizationName: '',
          isActive: false,
          name: 'Guest'
        };
      }
    });
  }

  setView(view: 'dashboard' | 'facilities' | 'equipment' | 'requests' | 'transactions' | 'settings'): void {
    this.currentView = view;

    // ✅ Route to profile when settings is clicked
    if (view === 'settings') {
      this.router.navigate(['/student-dashboard/settings/profile']);
    }

    // Refresh data when switching views
    if (view === 'transactions') {
      this.fetchAuditLogs();
    }
    if (view === 'equipment') {
      this.fetchEquipment();
    }
    if (view === 'facilities') {
      this.fetchFacilities();
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
      Returned: 'status-returned',
      Available: 'status-available',
      AVAILABLE: 'status-available',
      Reserved: 'status-reserved'
    };
    return map[status] || '';
  }
}