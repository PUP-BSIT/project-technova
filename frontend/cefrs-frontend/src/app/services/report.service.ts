import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DashboardStats {
  facilityUsage: FacilityUsageStats;
  equipmentUsage: EquipmentUsageStats;
  userActivity: UserActivityStats;
  dailyReservations: DailyReservationCount[];
}

export interface FacilityUsageStats {
  totalReservations: number;
  averageOccupancy: number;
  activeReservations: number;
  completedReservations: number;
}

export interface EquipmentUsageStats {
  averageDuration: number;
  totalBorrowings: number;
  activeBorrowings: number;
  overdueItems: number;
}

export interface UserActivityStats {
  peakHours: string;
  totalActiveUsers: number;
  todayReservations: number;
  todayBorrowings: number;
}

export interface DailyReservationCount {
  date: string;
  facilityCount: number;
  equipmentCount: number;
}

export interface FacilityReport {
  facilityId: number;
  facilityName: string;
  facilityType: string;
  totalReservations: number;
  utilizationRate: number;
  approvedReservations: number;
  pendingReservations: number;
  rejectedReservations: number;
}

export interface EquipmentReport {
  equipmentId: number;
  equipmentName: string;
  category: string;
  quantityTotal: number;
  quantityAvailable: number;
  totalBorrowings: number;
  utilizationRate: number;
  overdueCount: number;
}

export interface UserActivityReport {
  userId: number;
  userName: string;
  email: string;
  role: string;
  totalReservations: number;
  totalBorrowings: number;
  lastActivity: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private apiUrl = 'http://localhost:8080/api/reports';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('accessToken');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // Get complete dashboard statistics
  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/dashboard`, {
      headers: this.getHeaders()
    });
  }

  // Get facility usage statistics only
  getFacilityUsageStats(): Observable<FacilityUsageStats> {
    return this.http.get<FacilityUsageStats>(`${this.apiUrl}/facility-usage`, {
      headers: this.getHeaders()
    });
  }

  // Get equipment usage statistics only
  getEquipmentUsageStats(): Observable<EquipmentUsageStats> {
    return this.http.get<EquipmentUsageStats>(`${this.apiUrl}/equipment-usage`, {
      headers: this.getHeaders()
    });
  }

  // Get user activity statistics only
  getUserActivityStats(): Observable<UserActivityStats> {
    return this.http.get<UserActivityStats>(`${this.apiUrl}/user-activity`, {
      headers: this.getHeaders()
    });
  }

  // Get daily reservations for chart
  getDailyReservations(days: number = 30): Observable<DailyReservationCount[]> {
    return this.http.get<DailyReservationCount[]>(`${this.apiUrl}/daily-reservations?days=${days}`, {
      headers: this.getHeaders()
    });
  }

  // Get detailed facility usage report
  getFacilityReport(): Observable<FacilityReport[]> {
    return this.http.get<FacilityReport[]>(`${this.apiUrl}/facilities`, {
      headers: this.getHeaders()
    });
  }

  // Get detailed equipment usage report
  getEquipmentReport(): Observable<EquipmentReport[]> {
    return this.http.get<EquipmentReport[]>(`${this.apiUrl}/equipment`, {
      headers: this.getHeaders()
    });
  }

  // Get user activity report
  getUserActivityReport(): Observable<UserActivityReport[]> {
    return this.http.get<UserActivityReport[]>(`${this.apiUrl}/users`, {
      headers: this.getHeaders()
    });
  }
}