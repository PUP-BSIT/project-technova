import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Subject, takeUntil } from 'rxjs';
import { Chart, registerables } from 'chart.js';
import {
  ReportService,
  DashboardStats,
  FacilityReport,
  EquipmentReport,
  UserActivityReport
} from '../../../../services/report.service';
import { ExportService, ExportData } from '../../../../services/export.service';

// Register Chart.js components
Chart.register(...registerables);

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
  providers: [ReportService, ExportService]
})
export class ReportLogs implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('bookingTrendsCanvas') bookingTrendsCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('borrowingTrendsCanvas') borrowingTrendsCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('monthlyUsersCanvas') monthlyUsersCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('equipmentPieCanvas') equipmentPieCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('userPieCanvas') userPieCanvas?: ElementRef<HTMLCanvasElement>;

  private bookingTrendsChart?: Chart;
  private borrowingTrendsChart?: Chart;
  private monthlyUsersChart?: Chart;
  private equipmentPieChart?: Chart;
  private userPieChart?: Chart;

  activeTab: 'facility' | 'equipment' | 'user' = 'facility';
  private destroy$ = new Subject<void>();

  // Export dropdown state
  showExportDropdown = false;

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

  constructor(
    private reportService: ReportService,
    private exportService: ExportService
  ) { }

  ngOnInit(): void {
    this.loadDashboardStats();
    this.loadTabData(this.activeTab);
  }

  ngAfterViewInit(): void {
    // Charts will be created after data is loaded
  }

  ngOnDestroy(): void {
    // Destroy all charts
    this.bookingTrendsChart?.destroy();
    this.borrowingTrendsChart?.destroy();
    this.monthlyUsersChart?.destroy();
    this.equipmentPieChart?.destroy();
    this.userPieChart?.destroy();

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

  /* Switch between tabs */
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

  /* Load facility usage data */
  private loadFacilityData(): void {
    this.isLoadingFacility = true;

    this.reportService.getFacilityReport()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (reports) => {
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

          if (this.dashboardStats) {
            const facilityUsage = this.dashboardStats.facilityUsage;
            this.facilityStats = [
              { label: 'Total Reservations', value: facilityUsage.totalReservations },
              { label: 'Active Reservations', value: facilityUsage.activeReservations },
              { label: 'Average Occupancy', value: `${facilityUsage.averageOccupancy}%` },
              { label: 'Completed', value: facilityUsage.completedReservations }
            ];
          }

          this.isLoadingFacility = false;

          // Create chart after data is loaded
          setTimeout(() => this.createBookingTrendsChart(), 100);
        },
        error: (error) => {
          console.error('Error loading facility data:', error);
          this.isLoadingFacility = false;
        }
      });
  }

  /* Load equipment usage data */
  private loadEquipmentData(): void {
    this.isLoadingEquipment = true;

    this.reportService.getEquipmentReport()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (reports) => {
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

          const totalAvailable = reports.reduce((sum, r) => sum + r.quantityAvailable, 0);
          const totalBorrowed = reports.reduce((sum, r) => sum + (r.quantityTotal - r.quantityAvailable), 0);
          this.equipmentAvailability = {
            borrowed: totalBorrowed,
            available: totalAvailable,
            maintenance: 0
          };

          if (this.dashboardStats) {
            const equipmentUsage = this.dashboardStats.equipmentUsage;
            this.equipmentStats = [
              { label: 'Total Borrowings', value: equipmentUsage.totalBorrowings },
              { label: 'Active Borrowings', value: equipmentUsage.activeBorrowings },
              { label: 'Overdue Items', value: equipmentUsage.overdueItems },
              { label: 'Avg Duration', value: `${equipmentUsage.averageDuration}h` }
            ];
          }

          this.isLoadingEquipment = false;

          // Create charts after data is loaded
          setTimeout(() => {
            this.createBorrowingTrendsChart();
            this.createEquipmentPieChart();
          }, 100);
        },
        error: (error) => {
          console.error('Error loading equipment data:', error);
          this.isLoadingEquipment = false;
        }
      });
  }

  /* Load user activity data */
  private loadUserData(): void {
    this.isLoadingUser = true;

    this.reportService.getUserActivityReport()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (reports) => {
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

          const studentCount = reports.filter(r => r.role.toUpperCase() === 'STUDENT').length;
          const orgCount = reports.filter(r => r.role.toUpperCase() === 'ORGANIZATION').length;
          this.userDistribution = {
            students: studentCount,
            organizations: orgCount
          };

          if (this.dashboardStats) {
            const userActivity = this.dashboardStats.userActivity;
            this.userStats = [
              { label: 'Active Users', value: userActivity.totalActiveUsers },
              { label: 'Today Reservations', value: userActivity.todayReservations },
              { label: 'Today Borrowings', value: userActivity.todayBorrowings },
              { label: 'Peak Hours', value: userActivity.peakHours }
            ];
          }

          this.isLoadingUser = false;

          // Create chart after data is loaded
          setTimeout(() => this.createUserPieChart(), 100);
        },
        error: (error) => {
          console.error('Error loading user data:', error);
          this.isLoadingUser = false;
        }
      });
  }

  /* Create booking trends line chart */
  private createBookingTrendsChart(): void {
    if (!this.bookingTrendsCanvas || this.bookingTrendsData.labels.length === 0) return;

    const ctx = this.bookingTrendsCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    if (this.bookingTrendsChart) {
      this.bookingTrendsChart.destroy();
    }

    this.bookingTrendsChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.bookingTrendsData.labels,
        datasets: [{
          label: 'Reservations',
          data: this.bookingTrendsData.values,
          borderColor: '#69040C',
          backgroundColor: 'rgba(105, 4, 12, 0.1)',
          fill: true,
          tension: 0.4,
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: '#69040C',
            borderWidth: 1
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0
            }
          }
        }
      }
    });
  }

  /* Create borrowing trends bar chart */
  private createBorrowingTrendsChart(): void {
    if (!this.borrowingTrendsCanvas || this.borrowingTrendsData.labels.length === 0) return;

    const ctx = this.borrowingTrendsCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    if (this.borrowingTrendsChart) {
      this.borrowingTrendsChart.destroy();
    }

    this.borrowingTrendsChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.borrowingTrendsData.labels,
        datasets: [{
          label: 'Items Borrowed',
          data: this.borrowingTrendsData.values,
          backgroundColor: '#69040C',
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0
            }
          }
        }
      }
    });
  }

  /* Create equipment availability pie chart */
  private createEquipmentPieChart(): void {
    if (!this.equipmentPieCanvas) return;

    const ctx = this.equipmentPieCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    if (this.equipmentPieChart) {
      this.equipmentPieChart.destroy();
    }

    this.equipmentPieChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Currently Borrowed', 'Available', 'In Maintenance'],
        datasets: [{
          data: [
            this.equipmentAvailability.borrowed,
            this.equipmentAvailability.available,
            this.equipmentAvailability.maintenance
          ],
          backgroundColor: ['#69040C', '#34D399', '#FCD34D'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 15,
              font: {
                size: 12
              }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12
          }
        }
      }
    });
  }

  /* Create user distribution pie chart */
  private createUserPieChart(): void {
    if (!this.userPieCanvas) return;

    const ctx = this.userPieCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    if (this.userPieChart) {
      this.userPieChart.destroy();
    }

    this.userPieChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Students/Individual', 'Organization'],
        datasets: [{
          data: [
            this.userDistribution.students,
            this.userDistribution.organizations
          ],
          backgroundColor: ['#69040C', '#34D399'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 15,
              font: {
                size: 12
              }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12
          }
        }
      }
    });
  }

  /* Toggle export dropdown */
  toggleExportDropdown(): void {
    this.showExportDropdown = !this.showExportDropdown;
  }

  /* Export current tab data */
  exportReport(format: 'excel' | 'csv' | 'pdf'): void {
    const exportData = this.prepareExportData();
    const filename = `${exportData.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}`;

    switch (format) {
      case 'excel':
        this.exportService.exportToExcel(exportData, filename);
        break;
      case 'csv':
        this.exportService.exportToCSV(exportData, filename);
        break;
      case 'pdf':
        this.exportService.exportToPDF(exportData, filename);
        break;
    }

    this.showExportDropdown = false;
  }

  /* Prepare data for export based on active tab */
  private prepareExportData(): ExportData {
    switch (this.activeTab) {
      case 'facility':
        return {
          title: 'Facility Usage Report',
          headers: ['Rank', 'Facility Name', 'Total Bookings', 'Occupancy Rate', 'Status'],
          data: this.topFacilities.map(f => [
            f.rank,
            f.name,
            f.totalBookings,
            `${f.occupancyRate}%`,
            f.status === 'high-demand' ? 'High Demand' : 'Available'
          ]),
          stats: this.facilityStats
        };

      case 'equipment':
        return {
          title: 'Equipment Usage Report',
          headers: ['Rank', 'Equipment Name', 'Times Borrowed', 'Available', 'Total', 'Status'],
          data: this.topEquipment.map(e => [
            e.rank,
            e.name,
            e.timesBorrowed,
            e.available,
            e.total,
            e.status === 'low-stock' ? 'Low Stock' :
              e.status === 'available' ? 'Available' : 'Unavailable'
          ]),
          stats: this.equipmentStats
        };

      case 'user':
        return {
          title: 'User Activity Report',
          headers: ['Rank', 'User/Organization', 'Type', 'Total Activities', 'Last Active'],
          data: this.topUsers.map(u => [
            u.rank,
            u.name,
            u.type,
            u.totalActivities,
            u.lastActive
          ]),
          stats: this.userStats
        };

      default:
        return {
          title: 'Report',
          headers: [],
          data: []
        };
    }
  }

  /* Refresh data for the current tab */
  refreshData(): void {
    this.loadDashboardStats();

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