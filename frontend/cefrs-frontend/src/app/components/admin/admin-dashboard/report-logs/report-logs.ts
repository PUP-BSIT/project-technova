import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Subject, takeUntil } from 'rxjs';
import { 
  ReportsService, 
  StatCard, 
  FacilityBooking, 
  EquipmentBorrowed, 
  UserActivity,
  ChartData 
} from './reports.service';

@Component({
  selector: 'app-report-logs',
  templateUrl: './report-logs.html',
  styleUrls: ['./report-logs.scss'],
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  providers: [ReportsService]
})
export class ReportLogs implements OnInit, OnDestroy {
  activeTab: 'facility' | 'equipment' | 'user' = 'facility';
  private destroy$ = new Subject<void>();

  // Loading states
  isLoadingFacility = true;
  isLoadingEquipment = true;
  isLoadingUser = true;

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

  constructor(private reportsService: ReportsService) {}

  ngOnInit(): void {
    // Load initial data for the active tab
    this.loadTabData(this.activeTab);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Switch between tabs and load data if not already loaded
   */
  setActiveTab(tab: 'facility' | 'equipment' | 'user'): void {
    this.activeTab = tab;
    this.loadTabData(tab);
  }

  /**
   * Load data for the specified tab
   */
  private loadTabData(tab: 'facility' | 'equipment' | 'user'): void {
    switch (tab) {
      case 'facility':
        if (this.facilityStats.length === 0) {
          this.loadFacilityData();
        }
        break;
      case 'equipment':
        if (this.equipmentStats.length === 0) {
          this.loadEquipmentData();
        }
        break;
      case 'user':
        if (this.userStats.length === 0) {
          this.loadUserData();
        }
        break;
    }
  }

  /**
   * Load facility usage data from the service
   */
  private loadFacilityData(): void {
    this.isLoadingFacility = true;
    
    this.reportsService.getFacilityReport()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.facilityStats = data.stats;
          this.topFacilities = data.topFacilities;
          this.bookingTrendsData = data.bookingTrends;
          this.isLoadingFacility = false;
        },
        error: (error) => {
          console.error('Error loading facility data:', error);
          this.isLoadingFacility = false;
        }
      });
  }

  /**
   * Load equipment usage data from the service
   */
  private loadEquipmentData(): void {
    this.isLoadingEquipment = true;
    
    this.reportsService.getEquipmentReport()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.equipmentStats = data.stats;
          this.topEquipment = data.topEquipment;
          this.borrowingTrendsData = data.borrowingTrends;
          this.equipmentAvailability = data.availabilityDistribution;
          this.isLoadingEquipment = false;
        },
        error: (error) => {
          console.error('Error loading equipment data:', error);
          this.isLoadingEquipment = false;
        }
      });
  }

  /**
   * Load user activity data from the service
   */
  private loadUserData(): void {
    this.isLoadingUser = true;
    
    this.reportsService.getUserReport()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.userStats = data.stats;
          this.topUsers = data.topUsers;
          this.monthlyActiveUsersData = data.monthlyActiveUsers;
          this.userDistribution = data.userDistribution;
          this.isLoadingUser = false;
        },
        error: (error) => {
          console.error('Error loading user data:', error);
          this.isLoadingUser = false;
        }
      });
  }

  /**
   * Refresh data for the current tab
   */
  refreshData(): void {
    switch (this.activeTab) {
      case 'facility':
        this.facilityStats = [];
        this.loadFacilityData();
        break;
      case 'equipment':
        this.equipmentStats = [];
        this.loadEquipmentData();
        break;
      case 'user':
        this.userStats = [];
        this.loadUserData();
        break;
    }
  }

  /**
   * Get status CSS class
   */
  getStatusClass(status: string): string {
    return `status-${status}`;
  }

  /**
   * Check if current tab has data
   */
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

  /**
   * Check if current tab is loading
   */
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