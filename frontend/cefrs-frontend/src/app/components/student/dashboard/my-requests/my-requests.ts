import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReservationService } from '../../../../services/reservation.service';
import { EquipmentBorrowingService } from '../../../../services/equipment-borrowing.service';
import { EquipmentService } from '../../../../services/equipment.service';
import { FacilityService } from '../../../../services/facility.service';

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
  createdAtRaw?: string;
  imageUrl?: string;
}

@Component({
  selector: 'app-my-requests',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-requests.html',
  styleUrls: ['./my-requests.scss']
})
export class MyRequests implements OnInit {
  private reservationService = inject(ReservationService);
  private borrowingService = inject(EquipmentBorrowingService);
  private equipmentService = inject(EquipmentService);
  private facilityService = inject(FacilityService);

  allRequests: Request[] = [];
  searchQuery = '';
  selectedStatus = 'All Status';
  selectedType = 'All Types';

  ngOnInit(): void {
    this.fetchMyRequests();
  }

  fetchMyRequests(): void {
    this.allRequests = [];

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
        adminNotes: r.adminNotes || '',
        imageUrl: ''
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
        adminNotes: b.adminNotes || '',
        imageUrl: ''
      }));

      this.allRequests = [...resMapped, ...borMapped].sort((a, b) => {
        const aRaw = a.createdAtRaw || a.requestDate;
        const bRaw = b.createdAtRaw || b.requestDate;
        return (new Date(bRaw).getTime() || 0) - (new Date(aRaw).getTime() || 0);
      });

      // Fetch images for facilities and equipment where possible
      // For reservations (facilities)
      reservations.forEach((r: any) => {
        if (r.facilityId) {
          this.facilityService.getFacilityById(r.facilityId).toPromise().then(f => {
            const idx = this.allRequests.findIndex(it => it.id === `RES-${r.id}`);
            if (idx !== -1) {
              this.allRequests[idx].imageUrl = f?.imageUrl || '';
            }
          }).catch(() => {
            // ignore image errors
          });
        }
      });

      // For borrowings (equipment)
      borrowings.forEach((b: any) => {
        if (b.equipmentId) {
          this.equipmentService.getEquipmentById(b.equipmentId).toPromise().then(e => {
            const idx = this.allRequests.findIndex(it => it.id === `BOR-${b.id}`);
            if (idx !== -1) {
              this.allRequests[idx].imageUrl = e?.imageUrl || '';
            }
          }).catch(() => {
            // ignore image errors
          });
        }
      });
    }).catch(err => {
      console.error('Error fetching my requests', err);
      this.allRequests = [];
    });
  }

  get filteredRequests(): Request[] {
    let filtered = this.allRequests;

    if (this.selectedStatus !== 'All Status') {
      filtered = filtered.filter(req => req.status === this.selectedStatus);
    }

    if (this.selectedType !== 'All Types') {
      filtered = filtered.filter(req => req.type === this.selectedType);
    }

    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(req =>
        req.title.toLowerCase().includes(query) ||
        req.id.toLowerCase().includes(query) ||
        req.adminNotes.toLowerCase().includes(query)
      );
    }

    return filtered;
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
      Completed: 'status-completed',
      Overdue: 'status-rejected',
      Borrowed: 'status-approved'
    };
    return map[status] || '';
  }

  markBorrowingAsReturned(request: Request): void {
    if (request.type !== 'Equipment') return;
    const idParts = request.id.split('-');
    const id = Number(idParts[1]);
    this.borrowingService.markAsReturned(id).subscribe({
      next: () => this.fetchMyRequests(),
      error: (err) => console.error('Error marking borrowing returned', err)
    });
  }

  markReservationAsCompleted(request: Request): void {
    if (request.type !== 'Facility') return;
    const idParts = request.id.split('-');
    const id = Number(idParts[1]);
    this.reservationService.markAsCompleted(id).subscribe({
      next: () => this.fetchMyRequests(),
      error: (err) => console.error('Error marking reservation completed', err)
    });
  }
}