import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { ReportService } from '../../../../services/report.service';
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
    private reportService: ReportService,
    private calendarService: CalendarService,
    private authService: AuthService,
    private router: Router
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
      dashboardStats: this.reportService.getDashboardStats(),
      calendarEvents: this.calendarService.getAllCalendarEvents()
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          // Process dashboard stats
          const stats = data.dashboardStats;
          
          // Count all pending requests from calendar events
          const allPendingRequests = data.calendarEvents
            .filter(event => event.extendedProps.status === 'PENDING').length;
          
          this.stats = {
            activeRequests: stats.facilityUsage.activeReservations + stats.equipmentUsage.activeBorrowings,
            totalReservations: stats.facilityUsage.activeReservations,
            equipmentBorrowedToday: stats.equipmentUsage.activeBorrowings, // Changed: Use active borrowings instead of today's borrowings
            facilitiesInUse: allPendingRequests
          };

          // Process pending requests from calendar events
          this.pendingRequests = data.calendarEvents
            .filter(event => event.extendedProps.status === 'PENDING')
            .slice(0, 5) // Show only first 5
            .map(event => ({
              id: this.getEventIdNumber(event.id),
              type: event.extendedProps.type,
              name: event.extendedProps.userName,
              details: event.title,
              date: event.start,
              status: event.extendedProps.status
            }));

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
  navigateToRequests(filter?: string): void {
    this.router.navigate(['/admin-dashboard/manage-request'], {
      queryParams: filter ? { status: filter } : {}
    });
  }

  // Extract numeric ID from event ID string (e.g., "facility-123" to 123)
  private getEventIdNumber(eventId: string): number {
    const parts = eventId.split('-');
    return parseInt(parts[1], 10);
  }
}