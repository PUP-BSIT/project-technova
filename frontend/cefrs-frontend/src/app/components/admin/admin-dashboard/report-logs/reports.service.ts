import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface StatCard {
  label: string;
  value: string | number;
}

export interface FacilityBooking {
  rank: number;
  name: string;
  totalBookings: number;
  occupancyRate: number;
  status: 'high-demand' | 'available';
}

export interface EquipmentBorrowed {
  rank: number;
  name: string;
  timesBorrowed: number;
  available: number;
  total: number;
  status: 'low-stock' | 'available' | 'unavailable';
}

export interface UserActivity {
  rank: number;
  name: string;
  type: 'Organization' | 'Individual';
  totalActivities: number;
  lastActive: string;
}

export interface ChartData {
  labels: string[];
  values: number[];
}

export interface FacilityReport {
  stats: StatCard[];
  topFacilities: FacilityBooking[];
  bookingTrends: ChartData;
}

export interface EquipmentReport {
  stats: StatCard[];
  topEquipment: EquipmentBorrowed[];
  borrowingTrends: ChartData;
  availabilityDistribution: {
    borrowed: number;
    available: number;
    maintenance: number;
  };
}

export interface UserReport {
  stats: StatCard[];
  topUsers: UserActivity[];
  monthlyActiveUsers: ChartData;
  userDistribution: {
    students: number;
    organizations: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ReportsService {
  private apiUrl = '/api/reports'; // Update with your actual API endpoint

  constructor(private http: HttpClient) {}

  /**
   * Fetch facility usage report data
   */
  getFacilityReport(): Observable<FacilityReport> {
    return this.http.get<FacilityReport>(`${this.apiUrl}/facility`).pipe(
      catchError(this.handleError<FacilityReport>('getFacilityReport', this.getEmptyFacilityReport()))
    );
  }

  /**
   * Fetch equipment usage report data
   */
  getEquipmentReport(): Observable<EquipmentReport> {
    return this.http.get<EquipmentReport>(`${this.apiUrl}/equipment`).pipe(
      catchError(this.handleError<EquipmentReport>('getEquipmentReport', this.getEmptyEquipmentReport()))
    );
  }

  /**
   * Fetch user activity report data
   */
  getUserReport(): Observable<UserReport> {
    return this.http.get<UserReport>(`${this.apiUrl}/user`).pipe(
      catchError(this.handleError<UserReport>('getUserReport', this.getEmptyUserReport()))
    );
  }

  /**
   * Fetch booking trends for a specific date range
   */
  getBookingTrends(startDate?: string, endDate?: string): Observable<ChartData> {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    return this.http.get<ChartData>(`${this.apiUrl}/facility/trends`, { params }).pipe(
      catchError(this.handleError<ChartData>('getBookingTrends', { labels: [], values: [] }))
    );
  }

  /**
   * Fetch borrowing trends for equipment
   */
  getBorrowingTrends(period: 'week' | 'month' = 'week'): Observable<ChartData> {
    return this.http.get<ChartData>(`${this.apiUrl}/equipment/trends`, { params: { period } }).pipe(
      catchError(this.handleError<ChartData>('getBorrowingTrends', { labels: [], values: [] }))
    );
  }

  /**
   * Handle HTTP errors
   */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed:`, error);
      return of(result as T);
    };
  }

  /**
   * Empty state for facility report (when no data available)
   */
  private getEmptyFacilityReport(): FacilityReport {
    return {
      stats: [
        { label: 'Total Reservations', value: '0' },
        { label: 'Average Occupancy', value: '0%' },
        { label: 'Avg Duration', value: '0h' },
        { label: 'Peak Hours', value: 'N/A' }
      ],
      topFacilities: [],
      bookingTrends: { labels: [], values: [] }
    };
  }

  /**
   * Empty state for equipment report (when no data available)
   */
  private getEmptyEquipmentReport(): EquipmentReport {
    return {
      stats: [
        { label: 'Items Borrowed', value: '0' },
        { label: 'Utilization Rate', value: '0%' },
        { label: 'Avg Borrow Time', value: '0d' },
        { label: 'Overdue Items', value: '0' }
      ],
      topEquipment: [],
      borrowingTrends: { labels: [], values: [] },
      availabilityDistribution: {
        borrowed: 0,
        available: 0,
        maintenance: 0
      }
    };
  }

  /**
   * Empty state for user report (when no data available)
   */
  private getEmptyUserReport(): UserReport {
    return {
      stats: [
        { label: 'Active Users', value: '0' },
        { label: 'New Registrations', value: '0' },
        { label: 'Total Organizations', value: '0' },
        { label: 'Engagement Rate', value: '0%' }
      ],
      topUsers: [],
      monthlyActiveUsers: { labels: [], values: [] },
      userDistribution: {
        students: 0,
        organizations: 0
      }
    };
  }
}