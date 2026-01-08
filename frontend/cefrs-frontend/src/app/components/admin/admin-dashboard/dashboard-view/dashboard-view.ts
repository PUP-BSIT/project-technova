import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { ReservationService } from '../../../../services/reservation.service';
import { EquipmentBorrowingService } from '../../../../services/equipment-borrowing.service';
import { CalendarService } from '../../../../services/calendar.service';
import { AuthService } from '../../../../services/auth';

interface PendingRequest {
  id: number;
  type: 'equipment' | 'facility';
  name: string;
  details: string;
  date: string;
  status: string;
}

interface DashboardStats {
  activeRequests: number;
  totalReservations: number;
  equipmentBorrowedToday: number;
  facilitiesInUse: number;
}

@Component({
  selector: 'app-dashboard-view',
  templateUrl: './dashboard-view.html',
  styleUrls: ['./dashboard-view.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule]
})
export class DashboardView implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  @Output() viewAllRequested = new EventEmitter<void>();
  @Output() navigateToManageRequest = new EventEmitter<{ status?: string; type?: string }>();

  pendingRequests: PendingRequest[] = [];
  stats: DashboardStats = {
    activeRequests: 0,
    totalReservations: 0,
    equipmentBorrowedToday: 0,
    facilitiesInUse: 0
  };

  isLoading = false;
  adminId: number = 0;
  showApproveModal: boolean = false;
  showDeclineModal: boolean = false;
  selectedRequest: PendingRequest | null = null;
  approvalNotes: string = '';
  declineReason: string = '';
  sendNotification: boolean = true;
  actionLoading: boolean = false;

  constructor(
    private reservationService: ReservationService,
    private borrowingService: EquipmentBorrowingService,
    private calendarService: CalendarService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadAdminId();
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAdminId(): void {
    this.authService.getUserProfile()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (profile) => {
          this.adminId = profile.id;
        },
        error: (error) => {
          console.error('Error loading admin profile:', error);
        }
      });
  }

  loadDashboardData(): void {
    this.isLoading = true;

    forkJoin({
      reservations: this.reservationService.getAllReservations(),
      borrowings: this.borrowingService.getAllBorrowings()
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          const reservations = data.reservations.success ? data.reservations.data : [];
          const borrowings = data.borrowings.success ? data.borrowings.data : [];

          // Count approved facility reservations
          const approvedFacilities = reservations.filter(
            (r: any) => r.status?.toLowerCase() === 'approved'
          ).length;

          // Count approved/borrowed equipment
          const approvedEquipment = borrowings.filter(
            (b: any) => b.status?.toLowerCase() === 'approved' || b.status?.toLowerCase() === 'borrowed'
          ).length;

          // Count all pending requests
          const pendingFacilities = reservations.filter(
            (r: any) => r.status?.toLowerCase() === 'pending'
          ).length;
          const pendingEquipment = borrowings.filter(
            (b: any) => b.status?.toLowerCase() === 'pending'
          ).length;

          this.stats = {
            activeRequests: approvedFacilities + approvedEquipment,
            totalReservations: approvedFacilities,
            equipmentBorrowedToday: approvedEquipment,
            facilitiesInUse: pendingFacilities + pendingEquipment
          };

          // Process pending requests for the list
          const allPendingRequests: PendingRequest[] = [];

          // Add pending facility reservations
          reservations
            .filter((r: any) => r.status?.toLowerCase() === 'pending')
            .forEach((r: any) => {
              allPendingRequests.push({
                id: r.id,
                type: 'facility',
                name: r.userName,
                details: r.facilityName,
                date: r.reservationDate,
                status: r.status
              });
            });

          // Add pending equipment borrowings
          borrowings
            .filter((b: any) => b.status?.toLowerCase() === 'pending')
            .forEach((b: any) => {
              allPendingRequests.push({
                id: b.id,
                type: 'equipment',
                name: b.userName,
                details: b.equipmentName,
                date: b.borrowDate,
                status: b.status
              });
            });

          // Sort by date and take first 5
          this.pendingRequests = allPendingRequests
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 5);

          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading dashboard data:', error);
          this.isLoading = false;
        }
      });
  }

  approveRequest(request: PendingRequest): void {
    if ((request.status || '').toUpperCase() !== 'PENDING') return;
    this.selectedRequest = request;
    this.approvalNotes = '';
    this.sendNotification = true;
    this.showApproveModal = true;
  }

  declineRequest(request: PendingRequest): void {
    if ((request.status || '').toUpperCase() !== 'PENDING') return;
    this.selectedRequest = request;
    this.declineReason = '';
    this.sendNotification = true;
    this.showDeclineModal = true;
  }

  confirmApproval(): void {
    if (!this.selectedRequest || !this.adminId) return;
    this.actionLoading = true;

    const notes = this.approvalNotes || 'Approved';
    if (this.selectedRequest.type === 'facility') {
      this.calendarService.approveFacilityReservation(this.selectedRequest.id, this.adminId, notes)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.actionLoading = false;
            this.closeApproveModal();
            this.loadDashboardData();
          },
          error: (err) => {
            this.actionLoading = false;
            console.error('Error approving facility reservation:', err);
            alert('Failed to approve reservation');
          }
        });
    } else {
      this.calendarService.approveEquipmentBorrowing(this.selectedRequest.id, this.adminId, notes)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.actionLoading = false;
            this.closeApproveModal();
            this.loadDashboardData();
          },
          error: (err) => {
            this.actionLoading = false;
            console.error('Error approving equipment borrowing:', err);
            alert('Failed to approve borrowing');
          }
        });
    }
  }

  confirmDecline(): void {
    if (!this.selectedRequest || !this.declineReason.trim() || !this.adminId) return;
    this.actionLoading = true;

    const reason = this.declineReason;
    if (this.selectedRequest.type === 'facility') {
      this.calendarService.rejectFacilityReservation(this.selectedRequest.id, this.adminId, reason)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.actionLoading = false;
            this.closeDeclineModal();
            this.loadDashboardData();
          },
          error: (err) => {
            this.actionLoading = false;
            console.error('Error declining facility reservation:', err);
            alert('Failed to decline reservation');
          }
        });
    } else {
      this.calendarService.rejectEquipmentBorrowing(this.selectedRequest.id, this.adminId, reason)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.actionLoading = false;
            this.closeDeclineModal();
            this.loadDashboardData();
          },
          error: (err) => {
            this.actionLoading = false;
            console.error('Error declining equipment borrowing:', err);
            alert('Failed to decline borrowing');
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

  viewAllRequests(): void {
    this.viewAllRequested.emit();
  }

  // Navigate to manage requests with specific filter
  navigateToRequests(status?: string, type?: string): void {
    this.navigateToManageRequest.emit({ status, type });
  }
}