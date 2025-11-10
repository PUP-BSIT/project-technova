import { Component, OnInit } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ReservationService, Reservation } from '../../../../services/reservation.service';
import { EquipmentBorrowingService, EquipmentBorrowing } from '../../../../services/equipment-borrowing.service';

interface UnifiedRequest {
  id: number;
  type: 'facility' | 'equipment';
  name: string;
  requester: string;
  userName: string;
  dateTime?: string;
  borrowDate?: string;
  returnDate?: string;
  expectedReturnDate?: string;
  quantity?: number;
  purpose: string;
  status: string;
  adminNotes?: string;
  createdAt: string;
  // For facility reservations
  reservationDate?: string;
  startTime?: string;
  endTime?: string;
  // For equipment
  equipmentId?: number;
  facilityId?: number;
}

@Component({
  selector: 'app-manage-request',
  templateUrl: './manage-request.html',
  styleUrls: ['./manage-request.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, TitleCasePipe]
})
export class ManageRequest implements OnInit {
  searchText: string = '';
  selectedType: string = 'All Types';
  selectedStatus: string = 'All Status';
  showApproveModal: boolean = false;
  showDeclineModal: boolean = false;
  selectedRequest: UnifiedRequest | null = null;
  approvalNotes: string = '';
  declineReason: string = '';
  sendNotification: boolean = true;
  
  allRequests: UnifiedRequest[] = [];
  loading = false;
  actionLoading = false;
  error: string | null = null;
  successMessage: string | null = null;

  constructor(
    private reservationService: ReservationService,
    private borrowingService: EquipmentBorrowingService
  ) {}

  ngOnInit(): void {
    this.loadAllRequests();
  }

  loadAllRequests(): void {
    this.loading = true;
    this.error = null;

    // Load both reservations and equipment borrowings
    forkJoin({
      reservations: this.reservationService.getAllReservations(),
      borrowings: this.borrowingService.getAllBorrowings()
    }).subscribe({
      next: ({ reservations, borrowings }) => {
        this.allRequests = [];

        // Convert reservations to unified format
        if (reservations.success && reservations.data) {
          const reservationRequests: UnifiedRequest[] = reservations.data.map((r: Reservation) => ({
            id: r.id,
            type: 'facility',
            name: r.facilityName,
            requester: r.userName,
            userName: r.userName,
            facilityId: r.facilityId,
            reservationDate: r.reservationDate,
            dateTime: `${r.reservationDate} (${r.startTime} - ${r.endTime})`,
            startTime: r.startTime,
            endTime: r.endTime,
            purpose: r.purpose,
            status: r.status?.toLowerCase() || 'pending',
            adminNotes: r.adminNotes,
            createdAt: r.createdAt
          }));
          this.allRequests.push(...reservationRequests);
        }

        // Convert equipment borrowings to unified format
        if (borrowings.success && borrowings.data) {
          const borrowingRequests: UnifiedRequest[] = borrowings.data.map((b: EquipmentBorrowing) => ({
            id: b.id,
            type: 'equipment',
            name: b.equipmentName,
            requester: b.userName,
            userName: b.userName,
            equipmentId: b.equipmentId,
            borrowDate: b.borrowDate,
            returnDate: b.expectedReturnDate,
            expectedReturnDate: b.expectedReturnDate,
            quantity: b.quantity,
            purpose: b.purpose,
            status: b.status?.toLowerCase() || 'pending',
            adminNotes: b.adminNotes,
            createdAt: b.createdAt
          }));
          this.allRequests.push(...borrowingRequests);
        }

        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Failed to load requests';
        console.error('Error loading requests:', err);
      }
    });
  }

  get filteredRequests(): UnifiedRequest[] {
    let filtered = this.allRequests;

    // Filter by search text
    if (this.searchText.trim()) {
      const query = this.searchText.toLowerCase();
      filtered = filtered.filter(req =>
        req.name.toLowerCase().includes(query) ||
        req.requester.toLowerCase().includes(query) ||
        req.id.toString().includes(query) ||
        req.purpose.toLowerCase().includes(query)
      );
    }

    // Filter by type
    if (this.selectedType !== 'All Types') {
      const typeFilter = this.selectedType.toLowerCase() === 'facility' ? 'facility' : 'equipment';
      filtered = filtered.filter(req => req.type === typeFilter);
    }

    // Filter by status
    if (this.selectedStatus !== 'All Status') {
      const statusFilter = this.selectedStatus.toLowerCase();
      filtered = filtered.filter(req => req.status === statusFilter);
    }

    // Sort by creation date (newest first)
    return filtered.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  approveRequest(request: UnifiedRequest): void {
    if (request.status !== 'pending') {
      this.successMessage = null;
      this.error = 'Only pending requests can be approved.';
      setTimeout(() => this.error = null, 3000);
      return;
    }
    this.selectedRequest = request;
    this.approvalNotes = '';
    this.sendNotification = true;
    this.showApproveModal = true;
  }

  declineRequest(request: UnifiedRequest): void {
    if (request.status !== 'pending') {
      this.successMessage = null;
      this.error = 'Only pending requests can be declined.';
      setTimeout(() => this.error = null, 3000);
      return;
    }
    this.selectedRequest = request;
    this.declineReason = '';
    this.sendNotification = true;
    this.showDeclineModal = true;
  }

  confirmApproval(): void {
    if (!this.selectedRequest) return;

    this.actionLoading = true;
    this.error = null;

    const adminId = localStorage.getItem('userId');
    if (!adminId) {
      this.actionLoading = false;
      this.error = 'Your admin session is missing. Please sign in again to continue.';
      return;
    }

    if (this.selectedRequest.type === 'facility') {
      // Approve facility reservation
      this.reservationService.updateReservationStatus(
        this.selectedRequest.id,
        'APPROVED',
        this.approvalNotes
      ).subscribe({
        next: (response: any) => {
          this.actionLoading = false;
          if (response.success) {
            this.closeApproveModal();
            this.showSuccess('Facility reservation approved successfully.');
            this.loadAllRequests();
          }
        },
        error: (err: any) => {
          this.actionLoading = false;
          this.error = err.error?.message || 'Failed to approve reservation';
          console.error('Error approving reservation:', err);
        }
      });
    } else {
      // Approve equipment borrowing
      this.borrowingService.updateBorrowingStatus(
        this.selectedRequest.id,
        'APPROVED',
        this.approvalNotes
      ).subscribe({
        next: (response: any) => {
          this.actionLoading = false;
          if (response.success) {
            this.closeApproveModal();
            this.showSuccess('Equipment borrowing request approved successfully.');
            this.loadAllRequests();
          }
        },
        error: (err: any) => {
          this.actionLoading = false;
          this.error = err.error?.message || 'Failed to approve borrowing';
          console.error('Error approving borrowing:', err);
        }
      });
    }
  }

  confirmDecline(): void {
    if (!this.selectedRequest || !this.declineReason.trim()) return;

    this.actionLoading = true;
    this.error = null;

    const adminId = localStorage.getItem('userId');
    if (!adminId) {
      this.actionLoading = false;
      this.error = 'Your admin session is missing. Please sign in again to continue.';
      return;
    }

    if (this.selectedRequest.type === 'facility') {
      // Reject facility reservation
      this.reservationService.updateReservationStatus(
        this.selectedRequest.id,
        'REJECTED',
        this.declineReason
      ).subscribe({
        next: (response: any) => {
          this.actionLoading = false;
          if (response.success) {
            this.closeDeclineModal();
            this.showSuccess('Facility reservation declined successfully.');
            this.loadAllRequests();
          }
        },
        error: (err: any) => {
          this.actionLoading = false;
          this.error = err.error?.message || 'Failed to reject reservation';
          console.error('Error rejecting reservation:', err);
        }
      });
    } else {
      // Reject equipment borrowing
      this.borrowingService.updateBorrowingStatus(
        this.selectedRequest.id,
        'REJECTED',
        this.declineReason
      ).subscribe({
        next: (response: any) => {
          this.actionLoading = false;
          if (response.success) {
            this.closeDeclineModal();
            this.showSuccess('Equipment borrowing request declined successfully.');
            this.loadAllRequests();
          }
        },
        error: (err: any) => {
          this.actionLoading = false;
          this.error = err.error?.message || 'Failed to reject borrowing';
          console.error('Error rejecting borrowing:', err);
        }
      });
    }
  }

  closeApproveModal(): void {
    this.showApproveModal = false;
    this.selectedRequest = null;
    this.approvalNotes = '';
    this.actionLoading = false;
  }

  closeDeclineModal(): void {
    this.showDeclineModal = false;
    this.selectedRequest = null;
    this.declineReason = '';
    this.actionLoading = false;
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString();
  }

  private showSuccess(message: string): void {
    this.successMessage = message;
    setTimeout(() => {
      this.successMessage = null;
    }, 3000);
  }

  getStatusClass(status: string): string {
    const statusMap: Record<string, string> = {
      'pending': 'status-pending',
      'approved': 'status-approved',
      'rejected': 'status-declined',
      'declined': 'status-declined',
      'cancelled': 'status-declined',
      'returned': 'status-approved',
      'borrowed': 'status-approved'
    };
    return statusMap[status.toLowerCase()] || 'status-pending';
  }
}
