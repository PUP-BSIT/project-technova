import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';
import { AuditLogService, AuditLog } from '../../services/audit-log.service';
import { SidebarComponent } from '../sidebar/sidebar';

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

interface Facility {
  id: string;
  name: string;
  location: string;
  description: string;
  capacity: number;
  image: string;
  status: 'Available' | 'Reserved';
}

interface Equipment {
  id: string;
  name: string;
  description: string;
  category: string;
  available: number;
  total: number;
  image: string;
}

@Component({
  selector: 'app-org-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SidebarComponent],
  templateUrl: './org-dashboard.html',
  styleUrls: ['./org-dashboard.scss']
})
export class OrgDashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private auditLogService = inject(AuditLogService);
  private router = inject(Router);

  currentView: 'dashboard' | 'facilities' | 'equipment' | 'requests' | 'transactions' | 'settings' = 'dashboard';
  user: User | null = null;
  
  auditLogs: AuditLog[] = [];
  isLoadingLogs = false;

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

  facilities: Facility[] = [
    { id: '1', name: '4th Floor, Engr. AVR', location: '4th Floor, Engineering Building', description: 'Modern auditorium perfect for conferences and presentations with state-of-the-art AV equipment', capacity: 100, image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400', status: 'Available' },
    { id: '2', name: 'NCRPO AVR, Building B', location: 'NCRPO Building B', description: 'Versatile AVR space ideal for workshops, seminars, and corporate events', capacity: 60, image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400', status: 'Reserved' },
    { id: '3', name: 'Quadrangle, Building A', location: 'Building A Quadrangle', description: 'Open-air quadrangle perfect for outdoor events, ceremonies, and large gatherings', capacity: 150, image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=400', status: 'Available' }
  ];

  equipment: Equipment[] = [
    { id: '1', name: 'Microphone', description: 'High-quality microphone system perfect for presentations', category: 'Audio', available: 5, total: 5, image: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400' },
    { id: '2', name: 'Speaker', description: 'Powerful portable speaker system for events and presentations', category: 'Audio', available: 3, total: 3, image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400' },
    { id: '3', name: 'Folding Tables', description: 'Folding tables perfect for events and meetings', category: 'Furniture', available: 10, total: 10, image: 'https://images.unsplash.com/photo-1617325247661-675ab4b64ae2?w=400' },
    { id: '4', name: 'Stackable Chairs', description: 'Comfortable stackable chairs for events and meetings', category: 'Furniture', available: 50, total: 50, image: 'https://images.unsplash.com/photo-1503602642458-232111445657?w=400' },
    { id: '5', name: 'Projector', description: 'For displaying presentations, videos, and other visual content.', category: 'Visual', available: 5, total: 5, image: 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=400' },
    { id: '6', name: 'LED Par Light', description: 'Crucial for creating the right atmosphere and mood.', category: 'Lights', available: 5, total: 5, image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400' }
  ];

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
    
    // Refresh audit logs when transactions view is accessed
    if (view === 'transactions') {
      this.fetchAuditLogs();
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
      Reserved: 'status-reserved'
    };
    return map[status] || '';
  }
}