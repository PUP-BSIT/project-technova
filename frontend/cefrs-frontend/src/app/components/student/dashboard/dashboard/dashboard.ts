import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../services/auth';
import { ReservationService } from '../../../../services/reservation.service';
import { EquipmentBorrowingService } from '../../../../services/equipment-borrowing.service';

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
    this.fetchStats();
    this.fetchRecentRequests();
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

  fetchStats(): void {
    Promise.all([
      this.reservationService.getMyReservations().toPromise(),
      this.borrowingService.getMyBorrowings().toPromise()
    ]).then(([resResp, borResp]) => {
      const reservations: any[] = resResp?.data || [];
      const borrowings: any[] = borResp?.data || [];

      this.stats.totalRequests = reservations.length + borrowings.length;
      this.stats.activeReservations = reservations.filter(r => r.status === 'APPROVED').length;
      this.stats.borrowedEquipment = borrowings.filter(b => b.status === 'APPROVED' || b.status === 'BORROWED').length;
      this.stats.pendingRequests = reservations.filter(r => r.status === 'PENDING').length + 
                                    borrowings.filter(b => b.status === 'PENDING').length;
    }).catch(err => {
      console.error('Error fetching stats', err);
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