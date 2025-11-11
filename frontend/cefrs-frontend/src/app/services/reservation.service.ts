import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ReservationRequest {
  facilityId: number;
  startTime: string; // Format: "YYYY-MM-DD HH:mm:ss"
  endTime: string;   // Format: "YYYY-MM-DD HH:mm:ss"
  purpose: string;
}

export interface Reservation {
  id: number;
  userId: number;
  userName: string;
  facilityId: number;
  facilityName: string;
  reservationDate: string;
  startTime: string;
  endTime: string;
  purpose: string;
  status: string;
  adminNotes?: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private apiUrl = 'http://localhost:8080/api/reservations';

  constructor(private http: HttpClient) { }

  createReservation(request: ReservationRequest): Observable<ApiResponse<Reservation>> {
    return this.http.post<ApiResponse<Reservation>>(`${this.apiUrl}`, request);
  }

  getMyReservations(): Observable<ApiResponse<Reservation[]>> {
    return this.http.get<ApiResponse<Reservation[]>>(`${this.apiUrl}/me`);
  }

  getReservationById(id: number): Observable<ApiResponse<Reservation>> {
    return this.http.get<ApiResponse<Reservation>>(`${this.apiUrl}/${id}`);
  }

  getAvailability(facilityId: number, date: string): Observable<ApiResponse<Reservation[]>> {
    return this.http.get<ApiResponse<Reservation[]>>(
      `${this.apiUrl}/availability?facilityId=${facilityId}&date=${date}`
    );
  }

  cancelReservation(id: number): Observable<ApiResponse<void>> {
    const userId = localStorage.getItem('userId');
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}/cancel?userId=${userId}`);
  }

  markAsCompleted(id: number): Observable<ApiResponse<Reservation>> {
    return this.http.put<ApiResponse<Reservation>>(`${this.apiUrl}/${id}/complete`, null);
  }

  // Admin methods
  getAllReservations(): Observable<ApiResponse<Reservation[]>> {
    return this.http.get<ApiResponse<Reservation[]>>(`${this.apiUrl}`);
  }

  getPendingReservations(): Observable<ApiResponse<Reservation[]>> {
    return this.http.get<ApiResponse<Reservation[]>>(`${this.apiUrl}/pending`);
  }

  updateReservationStatus(id: number, status: string, adminNotes?: string): Observable<ApiResponse<Reservation>> {
    const adminId = localStorage.getItem('userId');
    const body: any = { status, adminNotes };
    const url = adminId
      ? `${this.apiUrl}/${id}/status?adminId=${adminId}`
      : `${this.apiUrl}/${id}/status`;
    return this.http.put<ApiResponse<Reservation>>(url, body);
  }
}

