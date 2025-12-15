import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
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
  imports: [CommonModule, RouterModule]
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
            totalReservations: stats.facilityUsage.activeReservations, // Only active facilities in use
            equipmentBorrowedToday: stats.userActivity.todayBorrowings,
            facilitiesInUse: allPendingRequests // All pending requests count
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
    if (!this.adminId) {
      alert('Admin ID not loaded. Please refresh the page.');
      return;
    }

    const notes = prompt('Enter approval notes (optional):') || 'Approved';

    if (request.type === 'facility') {
      this.calendarService.approveFacilityReservation(request.id, this.adminId, notes)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            alert('Facility reservation approved!');
            this.loadDashboardData(); // Reload data
          },
          error: (error) => {
            console.error('Error approving facility reservation:', error);
            alert('Failed to approve reservation');
          }
        });
    } else if (request.type === 'equipment') {
      this.calendarService.approveEquipmentBorrowing(request.id, this.adminId, notes)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            alert('Equipment borrowing approved!');
            this.loadDashboardData(); // Reload data
          },
          error: (error) => {
            console.error('Error approving equipment borrowing:', error);
            alert('Failed to approve borrowing');
          }
        });
    }
  }

  declineRequest(request: PendingRequest): void {
    if (!this.adminId) {
      alert('Admin ID not loaded. Please refresh the page.');
      return;
    }

    const notes = prompt('Enter rejection reason:');

    if (!notes) {
      alert('Rejection reason is required');
      return;
    }

    if (request.type === 'facility') {
      this.calendarService.rejectFacilityReservation(request.id, this.adminId, notes)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            alert('Facility reservation declined!');
            this.loadDashboardData(); // Reload data
          },
          error: (error) => {
            console.error('Error declining facility reservation:', error);
            alert('Failed to decline reservation');
          }
        });
    } else if (request.type === 'equipment') {
      this.calendarService.rejectEquipmentBorrowing(request.id, this.adminId, notes)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            alert('Equipment borrowing declined!');
            this.loadDashboardData(); // Reload data
          },
          error: (error) => {
            console.error('Error declining equipment borrowing:', error);
            alert('Failed to decline borrowing');
          }
        });
    }
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