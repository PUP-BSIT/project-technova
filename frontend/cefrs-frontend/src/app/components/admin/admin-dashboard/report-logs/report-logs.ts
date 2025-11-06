import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Subject, takeUntil } from 'rxjs';
import {
  ReportService,
  DashboardStats,
  FacilityReport,
  EquipmentReport,
  UserActivityReport
} from '../../../../services/report.service';

interface StatCard {
  label: string;
  value: string | number;
  icon?: string;
  trend?: string;
}

interface ChartData {
  labels: string[];
  values: number[];
}

interface FacilityBooking {
  rank: number;
  name: string;
  totalBookings: number;
  occupancyRate: number;
  status: string;
}

interface EquipmentBorrowed {
  rank: number;
  name: string;
  timesBorrowed: number;
  available: number;
  total: number;
  status: string;
}

interface UserActivity {
  rank: number;
  name: string;
  type: string;
  totalActivities: number;
  lastActive: string;
}

@Component({
  selector: 'app-report-logs',
  templateUrl: './report-logs.html',
  styleUrls: ['./report-logs.scss'],
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  providers: [ReportService]
})
export class ReportLogs implements OnInit, OnDestroy {
  activeTab: 'facility' | 'equipment' | 'user' = 'facility';
  private destroy$ = new Subject<void>();

  // Loading states
  isLoadingFacility = true;
  isLoadingEquipment = true;
  isLoadingUser = true;

  // Dashboard Stats
  dashboardStats: DashboardStats | null = null;

  // Facility Usage Data
  facilityStats: StatCard[] = [];
  topFacilities: FacilityBooking[] = [];
  bookingTrendsData: ChartData = { labels: [], values: [] };

  // Equipment Usage Data
  equipmentStats: StatCard[] = [];
  topEquipment: EquipmentBorrowed[] = [];
  borrowingTrendsData: ChartData = { labels: [], values: [] };
  equipmentAvailability = {
    borrowed: 0,
    available: 0,
    maintenance: 0
  };

  // User Activity Data
  userStats: StatCard[] = [];
  topUsers: UserActivity[] = [];
  monthlyActiveUsersData: ChartData = { labels: [], values: [] };
  userDistribution = {
    students: 0,
    organizations: 0
  };

  constructor(private reportService: ReportService) { }

  ngOnInit(): void {
    // Load dashboard stats first
    this.loadDashboardStats();
    // Load initial data for the active tab
    this.loadTabData(this.activeTab);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /* Load dashboard statistics */
  private loadDashboardStats(): void {
    this.reportService.getDashboardStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats) => {
          this.dashboardStats = stats;

          // Transform daily reservations into chart data
          if (stats.dailyReservations && stats.dailyReservations.length > 0) {
            this.bookingTrendsData = {
              labels: stats.dailyReservations.map(d => d.date),
              values: stats.dailyReservations.map(d => d.facilityCount)
            };

            this.borrowingTrendsData = {
              labels: stats.dailyReservations.map(d => d.date),
              values: stats.dailyReservations.map(d => d.equipmentCount)
            };
          }

          console.log('Dashboard stats loaded:', stats);
        },
        error: (error) => {
          console.error('Error loading dashboard stats:', error);
        }
      });
  }

  /* Switch between tabs and load data if not already loaded */
  setActiveTab(tab: 'facility' | 'equipment' | 'user'): void {
    this.activeTab = tab;
    this.loadTabData(tab);
  }

  /* Load data for the specified tab */
  private loadTabData(tab: 'facility' | 'equipment' | 'user'): void {
    switch (tab) {
      case 'facility':
        if (this.topFacilities.length === 0) {
          this.loadFacilityData();
        }
        break;
      case 'equipment':
        if (this.topEquipment.length === 0) {
          this.loadEquipmentData();
        }
        break;
      case 'user':
        if (this.topUsers.length === 0) {
          this.loadUserData();
        }
        break;
    }
  }

  /* Load facility usage data from the backend */
  private loadFacilityData(): void {
    this.isLoadingFacility = true;

    this.reportService.getFacilityReport()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (reports) => {
          // Transform backend data to match template format
          this.topFacilities = reports
            .sort((a, b) => b.totalReservations - a.totalReservations)
            .slice(0, 3)
            .map((report, index) => ({
              rank: index + 1,
              name: report.facilityName,
              totalBookings: report.totalReservations,
              occupancyRate: report.utilizationRate,
              status: report.utilizationRate > 75 ? 'high-demand' : 'available'
            }));

          // Create stat cards from dashboard stats
          if (this.dashboardStats) {
            const facilityUsage = this.dashboardStats.facilityUsage;
            this.facilityStats = [
              {
                label: 'Total Reservations',
                value: facilityUsage.totalReservations,
                icon: '📊'
              },
              {
                label: 'Active Reservations',
                value: facilityUsage.activeReservations,
                icon: '✅'
              },
              {
                label: 'Average Occupancy',
                value: `${facilityUsage.averageOccupancy}%`,
                icon: '📈'
              },
              {
                label: 'Completed',
                value: facilityUsage.completedReservations,
                icon: '✔️'
              }
            ];
          }

          this.isLoadingFacility = false;
          console.log('Facility reports loaded:', this.topFacilities);
        },
        error: (error) => {
          console.error('Error loading facility data:', error);
          this.isLoadingFacility = false;
        }
      });
  }

  /* Load equipment usage data from the backend */
  private loadEquipmentData(): void {
    this.isLoadingEquipment = true;

    this.reportService.getEquipmentReport()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (reports) => {
          // Transform backend data to match template format
          this.topEquipment = reports
            .sort((a, b) => b.totalBorrowings - a.totalBorrowings)
            .slice(0, 5)
            .map((report, index) => ({
              rank: index + 1,
              name: report.equipmentName,
              timesBorrowed: report.totalBorrowings,
              available: report.quantityAvailable,
              total: report.quantityTotal,
              status: report.quantityAvailable === 0 ? 'unavailable' :
                report.quantityAvailable < report.quantityTotal * 0.2 ? 'low-stock' :
                  'available'
            }));

          // Calculate equipment availability distribution
          const totalAvailable = reports.reduce((sum, r) => sum + r.quantityAvailable, 0);
          const totalBorrowed = reports.reduce((sum, r) => sum + (r.quantityTotal - r.quantityAvailable), 0);
          this.equipmentAvailability = {
            borrowed: totalBorrowed,
            available: totalAvailable,
            maintenance: 0 // Not provided by backend
          };

          // Create stat cards from dashboard stats
          if (this.dashboardStats) {
            const equipmentUsage = this.dashboardStats.equipmentUsage;
            this.equipmentStats = [
              {
                label: 'Total Borrowings',
                value: equipmentUsage.totalBorrowings,
                icon: '📦'
              },
              {
                label: 'Active Borrowings',
                value: equipmentUsage.activeBorrowings,
                icon: '🔄'
              },
              {
                label: 'Overdue Items',
                value: equipmentUsage.overdueItems,
                icon: '⚠️'
              },
              {
                label: 'Avg Duration',
                value: `${equipmentUsage.averageDuration}h`,
                icon: '⏱️'
              }
            ];
          }

          this.isLoadingEquipment = false;
          console.log('Equipment reports loaded:', this.topEquipment);
        },
        error: (error) => {
          console.error('Error loading equipment data:', error);
          this.isLoadingEquipment = false;
        }
      });
  }

  /* Load user activity data from the backend */
  private loadUserData(): void {
    this.isLoadingUser = true;

    this.reportService.getUserActivityReport()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (reports) => {
          // Transform backend data to match template format
          this.topUsers = reports
            .map(report => ({
              ...report,
              totalActivities: report.totalReservations + report.totalBorrowings
            }))
            .sort((a, b) => b.totalActivities - a.totalActivities)
            .slice(0, 10)
            .map((report, index) => ({
              rank: index + 1,
              name: report.userName,
              type: report.role,
              totalActivities: report.totalActivities,
              lastActive: report.lastActivity
            }));

          // Calculate user distribution
          const studentCount = reports.filter(r => r.role.toUpperCase() === 'STUDENT').length;
          const orgCount = reports.filter(r => r.role.toUpperCase() === 'ORGANIZATION').length;
          this.userDistribution = {
            students: studentCount,
            organizations: orgCount
          };

          // Create stat cards from dashboard stats
          if (this.dashboardStats) {
            const userActivity = this.dashboardStats.userActivity;
            this.userStats = [
              {
                label: 'Active Users',
                value: userActivity.totalActiveUsers,
                icon: '👥'
              },
              {
                label: 'Today Reservations',
                value: userActivity.todayReservations,
                icon: '📅'
              },
              {
                label: 'Today Borrowings',
                value: userActivity.todayBorrowings,
                icon: '📦'
              },
              {
                label: 'Peak Hours',
                value: userActivity.peakHours,
                icon: '⏰'
              }
            ];
          }

          this.isLoadingUser = false;
          console.log('User reports loaded:', this.topUsers);
        },
        error: (error) => {
          console.error('Error loading user data:', error);
          this.isLoadingUser = false;
        }
      });
  }

  /* Refresh data for the current tab */
  refreshData(): void {
    this.loadDashboardStats(); // Refresh dashboard stats too

    switch (this.activeTab) {
      case 'facility':
        this.topFacilities = [];
        this.loadFacilityData();
        break;
      case 'equipment':
        this.topEquipment = [];
        this.loadEquipmentData();
        break;
      case 'user':
        this.topUsers = [];
        this.loadUserData();
        break;
    }
  }

  /* Get status SCSS class*/
  getStatusClass(status: string): string {
    return `status-${status}`;
  }

  /* Check if current tab has data */
  hasData(): boolean {
    switch (this.activeTab) {
      case 'facility':
        return this.topFacilities.length > 0;
      case 'equipment':
        return this.topEquipment.length > 0;
      case 'user':
        return this.topUsers.length > 0;
      default:
        return false;
    }
  }

  /* Check if current tab is loading */
  isLoading(): boolean {
    switch (this.activeTab) {
      case 'facility':
        return this.isLoadingFacility;
      case 'equipment':
        return this.isLoadingEquipment;
      case 'user':
        return this.isLoadingUser;
      default:
        return false;
    }
  }
}