import { Component, OnInit, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../services/auth';
import { ReservationService } from '../../../../services/reservation.service';
import { EquipmentBorrowingService } from '../../../../services/equipment-borrowing.service';
import { DashboardService } from '../../../../services/dashboard.service';
import { firstValueFrom } from 'rxjs';

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

  @Output() viewChangeRequest = new EventEmitter<string>();

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
        this.fetchRecentRequests();
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
    
    if (userId && userId > 0) {
      // First try to get stats from the dashboard API
      this.dashboardService.getUserStats(userId).subscribe({
        next: (response) => {
          
          if (response.success && response.data) {
            this.stats = {
              activeReservations: Number(response.data.activeReservations) || 0,
              borrowedEquipment: Number(response.data.borrowedEquipment) || 0,
              pendingRequests: Number(response.data.pendingRequests) || 0,
              totalRequests: Number(response.data.totalRequests) || 0
            };
            
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
      firstValueFrom(this.reservationService.getMyReservations()),
      firstValueFrom(this.borrowingService.getMyBorrowings())
    ]).then(([resResp, borResp]) => {
      const reservations: any[] = resResp?.data || [];
      const borrowings: any[] = borResp?.data || [];

      

      // Log all reservation statuses for debugging
      reservations.forEach(r => {
        
      });

      this.stats.totalRequests = reservations.length + borrowings.length;
      
      // Active Reservations: Approved facility reservations + Approved/Borrowed equipment
        const approvedReservations = reservations.filter(r => {
        const status = r.status ? r.status.toUpperCase() : '';
        const isApproved = status === 'APPROVED';
        if (isApproved) {
          
        }
        return isApproved;
      });
      
        const activeEquipment = borrowings.filter(b => {
        const status = b.status ? b.status.toUpperCase() : '';
        const isActive = status === 'APPROVED' || status === 'BORROWED';
        if (isActive) {
          
        }
        return isActive;
      });
      
      // Active Reservations includes both facility and equipment
      this.stats.activeReservations = approvedReservations.length + activeEquipment.length;
      
      // Borrowed Equipment: Only currently borrowed equipment (BORROWED status)
      this.stats.borrowedEquipment = borrowings.filter(b => 
        b.status && b.status.toUpperCase() === 'BORROWED'
      ).length;
      
      this.stats.pendingRequests = reservations.filter(r => 
        r.status && r.status.toUpperCase() === 'PENDING'
      ).length + borrowings.filter(b => 
        b.status && b.status.toUpperCase() === 'PENDING'
      ).length;

      
    }).catch(err => {
      console.error('Error fetching stats manually', err);
    });
  }

  fetchRecentRequests(): void {
    const userId = this.user?.id || this.getUserIdFromStorage();
    if (!userId || userId <= 0) {
      this.recentRequests = [];
      return;
    }

    Promise.all([
      firstValueFrom(this.reservationService.getMyReservations()),
      firstValueFrom(this.borrowingService.getMyBorrowings())
    ]).then(([resResp, borResp]) => {
      const reservations: any[] = resResp?.data || [];
      const borrowings: any[] = borResp?.data || [];

      const userReservations = reservations.filter(r => !r.userId || r.userId === userId || r.studentId === userId);
      const userBorrowings = borrowings.filter(b => !b.userId || b.userId === userId || b.studentId === userId);

      const resMapped = userReservations.map(r => ({
        id: `FAC-${r.id}`,
        title: r.facilityName || 'Facility Reservation',
        type: 'Facility' as const,
        status: this.prettyStatus(r.status),
        requestDate: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : (r.reservationDate || ''),
        createdAtRaw: r.createdAt,
        dayOfEvent: r.reservationDate || '',
        adminNotes: r.adminNotes || ''
      }));

      const borMapped = userBorrowings.map(b => ({
        id: `EQP-${b.id}`,
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
        const aRaw = (a as any).createdAtRaw;
        const bRaw = (b as any).createdAtRaw;
        if (aRaw && bRaw) {
          return new Date(bRaw).getTime() - new Date(aRaw).getTime();
        }
        return (new Date(b.requestDate).getTime() || 0) - (new Date(a.requestDate).getTime() || 0);
      });

      this.recentRequests = allRequests.slice(0, 5);
    }).catch(err => {
      console.error('Error fetching recent requests', err);
      this.recentRequests = [];
    });
  }

  navigateToRequests(): void {
    this.viewChangeRequest.emit('requests');
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
      BORROWED: 'Borrowed',
      WAITLISTED: 'Waitlisted',
      CANCELLED: 'Cancelled'
    };
    return map[raw.toUpperCase()] || raw;
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      Approved: 'status-approved',
      Pending: 'status-pending',
      Rejected: 'status-rejected',
      Returned: 'status-returned',
      Completed: 'status-completed',
      Waitlisted: 'status-waitlisted',
      Cancelled: 'status-cancelled'
    };
    return map[status] || '';
  }
}