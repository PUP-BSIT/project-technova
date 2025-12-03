import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface DashboardStatsDTO {
  activeReservations: number;
  borrowedEquipment: number;
  pendingRequests: number;
  totalRequests: number;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
    private apiUrl = '/api/dashboard';

    constructor(private http: HttpClient) { }

    getUserDashboard(userId: number): Observable<ApiResponse<any>> {
        return this.http.get<ApiResponse<any>>(`${this.apiUrl}/user/${userId}`);
    }

    getUserStats(userId: number): Observable<ApiResponse<DashboardStatsDTO>> {
        return this.http.get<ApiResponse<DashboardStatsDTO>>(`${this.apiUrl}/stats/user/${userId}`);
    }
}