import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReservationService } from '../../../../services/reservation.service';
import { EquipmentBorrowingService } from '../../../../services/equipment-borrowing.service';

interface Request {
  id: string;
  title: string;
  type: 'Equipment' | 'Facility';
  status: string;
  quantity?: number;
  requestDate: string; // display date
  createdAtRaw?: string; // ISO timestamp for sorting
  returnDate?: string;
  dayOfEvent?: string;
  adminNotes: string;
}

@Component({
  selector: 'app-org-my-request',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-request.html',
  styleUrls: ['./my-request.scss']
})
export class OrgMyRequestComponent implements OnInit {
  searchQuery = '';
  selectedStatus = 'All Status';
  selectedType = 'All Types';
  private reservationService = inject(ReservationService);
  private borrowingService = inject(EquipmentBorrowingService);

  allRequests: Request[] = [];

  loading = false;

  ngOnInit(): void {
    this.loadMyRequests();
  }

  private mapReservationToRequest(r: any): Request {
    const status = this.prettyStatus(r.status);
    return {
      id: `RES-${r.id}`,
      title: r.facilityName || 'Facility Reservation',
      type: 'Facility',
      status,
      requestDate: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : (r.reservationDate || ''),
      createdAtRaw: r.createdAt,
      dayOfEvent: r.reservationDate || '',
      adminNotes: r.adminNotes || ''
    };
  }

  private mapBorrowingToRequest(b: any): Request {
    const status = this.prettyStatus(b.status);
    return {
      id: `BOR-${b.id}`,
      title: b.equipmentName || 'Equipment Borrowing',
      type: 'Equipment',
      status,
      quantity: b.quantity,
      requestDate: b.createdAt ? new Date(b.createdAt).toLocaleDateString() : (b.borrowDate || ''),
      createdAtRaw: b.createdAt,
      returnDate: b.actualReturnDate || b.expectedReturnDate || '',
      adminNotes: b.adminNotes || ''
    };
  }

  private prettyStatus(raw: string): any {
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

  loadMyRequests(): void {
    this.loading = true;
    // fetch reservations and borrowings in parallel
    Promise.all([
      this.reservationService.getMyReservations().toPromise(),
      this.borrowingService.getMyBorrowings().toPromise()
    ]).then(([resResp, borResp]) => {
      const reservations: any[] = resResp?.data || [];
      const borrowings: any[] = borResp?.data || [];
      this.allRequests = [
        ...reservations.map(r => this.mapReservationToRequest(r)),
        ...borrowings.map(b => this.mapBorrowingToRequest(b))
      ].sort((a, b) => {
        const aRaw = a.createdAtRaw || a.requestDate;
        const bRaw = b.createdAtRaw || b.requestDate;
        return (new Date(bRaw).getTime() || 0) - (new Date(aRaw).getTime() || 0);
      });
    }).catch(err => {
      console.error('Error loading requests', err);
      this.allRequests = [];
    }).finally(() => this.loading = false);
  }

  markAsReturned(request: Request): void {
    // only for borrowings
    if (request.type !== 'Equipment') return;
    const idParts = request.id.split('-');
    const id = Number(idParts[1]);
    this.borrowingService.markAsReturned(id).subscribe({
      next: () => this.loadMyRequests(),
      error: (err) => console.error('Error marking returned', err)
    });
  }

  markReservationCompleted(request: Request): void {
    if (request.type !== 'Facility') return;
    const idParts = request.id.split('-');
    const id = Number(idParts[1]);
    this.reservationService.markAsCompleted(id).subscribe({
      next: () => this.loadMyRequests(),
      error: (err) => console.error('Error marking completed', err)
    });
  }

  get filteredRequests(): Request[] {
    let filtered = this.allRequests;

    // Filter by search query
    if (this.searchQuery) {
      filtered = filtered.filter(request =>
        request.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        request.id.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }

    // Filter by status
    if (this.selectedStatus !== 'All Status') {
      filtered = filtered.filter(request => request.status === this.selectedStatus);
    }

    // Filter by type
    if (this.selectedType !== 'All Types') {
      filtered = filtered.filter(request => request.type === this.selectedType);
    }

    return filtered;
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

