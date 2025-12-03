import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../services/auth';
import { ReservationService } from '../../../../services/reservation.service';
import { EquipmentBorrowingService } from '../../../../services/equipment-borrowing.service';
import { DashboardService } from '../../../../services/dashboard.service';

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
  status: string;
  quantity?: number;
  requestDate: string;
  returnDate?: string;
  dayOfEvent?: string;
  adminNotes: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class Dashboard implements OnInit {
  private authService = inject(AuthService);
  private reservationService = inject(ReservationService);
  private borrowingService = inject(EquipmentBorrowingService);
  private dashboardService = inject(DashboardService);

  user: User | null = null;
  
  stats = {
    activeReservations: 0,
    borrowedEquipment: 0,
    pendingRequests: 0,
    totalRequests: 0
  };

  recentRequests: Request[] = [];

  ngOnInit(): void {
    this.fetchUserProfile();
    this.fetchRecentRequests();
    
    // Refresh stats periodically (every 30 seconds) to catch updates
    setInterval(() => {
      if (this.user?.id) {
        this.fetchStats();
      }
    }, 30000);
  }

  fetchUserProfile(): void {
    this.authService.getUserProfile().subscribe({
      next: (profile) => {
        this.user = profile;
        this.user.name = `${profile.firstName} ${profile.lastName}`;
        // Fetch stats after user profile is loaded
        this.fetchStats();
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
        // Try to fetch stats manually if profile fails
        this.fetchStats();
      }
    });
  }

  fetchStats(): void {
    // Try to get userId from user object or localStorage
    const userId = this.user?.id || this.getUserIdFromStorage();
    
    console.log('Fetching stats for userId:', userId);
    
    if (userId && userId > 0) {
      // First try to get stats from the dashboard API
      this.dashboardService.getUserStats(userId).subscribe({
        next: (response) => {
          console.log('Dashboard API response:', response);
          if (response.success && response.data) {
            this.stats = {
              activeReservations: Number(response.data.activeReservations) || 0,
              borrowedEquipment: Number(response.data.borrowedEquipment) || 0,
              pendingRequests: Number(response.data.pendingRequests) || 0,
              totalRequests: Number(response.data.totalRequests) || 0
            };
            console.log('Stats updated from API:', this.stats);
          } else {
            console.warn('Dashboard API response structure unexpected, falling back to manual calculation', response);
            // Fallback if response structure is different
            this.fetchStatsManually();
          }
        },
        error: (err) => {
          console.error('Error fetching stats from dashboard API, falling back to manual calculation', err);
          this.fetchStatsManually();
        }
      });
    } else {
      console.warn('No userId available, fetching stats manually');
      // If userId is not available, fetch manually as fallback
      this.fetchStatsManually();
    }
  }

  private getUserIdFromStorage(): number | null {
    const userIdStr = localStorage.getItem('userId');
    if (userIdStr) {
      const userId = parseInt(userIdStr, 10);
      return isNaN(userId) ? null : userId;
    }
    return null;
  }

  private fetchStatsManually(): void {
    Promise.all([
      this.reservationService.getMyReservations().toPromise(),
      this.borrowingService.getMyBorrowings().toPromise()
    ]).then(([resResp, borResp]) => {
      const reservations: any[] = resResp?.data || [];
      const borrowings: any[] = borResp?.data || [];

      console.log('Manual stats calculation - Reservations:', reservations);
      console.log('Manual stats calculation - Borrowings:', borrowings);

      // Log all reservation statuses for debugging
      reservations.forEach(r => {
        console.log(`Reservation ${r.id}: status = "${r.status}" (type: ${typeof r.status})`);
      });

      this.stats.totalRequests = reservations.length + borrowings.length;
      
      // Use case-insensitive comparison for status
      const approvedReservations = reservations.filter(r => {
        const status = r.status ? r.status.toUpperCase() : '';
        const isApproved = status === 'APPROVED';
        if (isApproved) {
          console.log(`Found approved reservation: ${r.id} - ${r.facilityName || 'Unknown'}`);
        }
        return isApproved;
      });
      
      this.stats.activeReservations = approvedReservations.length;
      
      this.stats.borrowedEquipment = borrowings.filter(b => 
        b.status && (b.status.toUpperCase() === 'APPROVED' || b.status.toUpperCase() === 'BORROWED')
      ).length;
      
      this.stats.pendingRequests = reservations.filter(r => 
        r.status && r.status.toUpperCase() === 'PENDING'
      ).length + borrowings.filter(b => 
        b.status && b.status.toUpperCase() === 'PENDING'
      ).length;

      console.log('Manual stats calculated:', this.stats);
    }).catch(err => {
      console.error('Error fetching stats manually', err);
    });
  }

  fetchRecentRequests(): void {
    Promise.all([
      this.reservationService.getMyReservations().toPromise(),
      this.borrowingService.getMyBorrowings().toPromise()
    ]).then(([resResp, borResp]) => {
      const reservations: any[] = resResp?.data || [];
      const borrowings: any[] = borResp?.data || [];

      const resMapped = reservations.map(r => ({
        id: `RES-${r.id}`,
        title: r.facilityName || 'Facility Reservation',
        type: 'Facility' as const,
        status: this.prettyStatus(r.status),
        requestDate: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : (r.reservationDate || ''),
        createdAtRaw: r.createdAt,
        dayOfEvent: r.reservationDate || '',
        adminNotes: r.adminNotes || ''
      }));

      const borMapped = borrowings.map(b => ({
        id: `BOR-${b.id}`,
        title: b.equipmentName || 'Equipment Borrowing',
        type: 'Equipment' as const,
        status: this.prettyStatus(b.status),
        quantity: b.quantity,
        requestDate: b.createdAt ? new Date(b.createdAt).toLocaleDateString() : (b.borrowDate || ''),
        createdAtRaw: b.createdAt,
        returnDate: b.actualReturnDate || b.expectedReturnDate || '',
        adminNotes: b.adminNotes || ''
      }));

      const allRequests = [...resMapped, ...borMapped].sort((a, b) => {
        const aRaw = (a as any).createdAtRaw || a.requestDate;
        const bRaw = (b as any).createdAtRaw || b.requestDate;
        return (new Date(bRaw).getTime() || 0) - (new Date(aRaw).getTime() || 0);
      });

      this.recentRequests = allRequests.slice(0, 5);
    }).catch(err => {
      console.error('Error fetching recent requests', err);
    });
  }

  private prettyStatus(raw: string): string {
    if (!raw) return 'Pending';
    const map: Record<string, string> = {
      PENDING: 'Pending',
      APPROVED: 'Approved',
      REJECTED: 'Rejected',
      RETURNED: 'Returned',
      COMPLETED: 'Completed',
      OVERDUE: 'Overdue',
      BORROWED: 'Borrowed'
    };
    return map[raw.toUpperCase()] || raw;
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      Approved: 'status-approved',
      Pending: 'status-pending',
      Rejected: 'status-rejected',
      Returned: 'status-returned',
      Completed: 'status-completed'
    };
    return map[status] || '';
  }
}