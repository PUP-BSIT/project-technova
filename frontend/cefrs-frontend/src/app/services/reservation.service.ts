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
  userRole?: string;
  studentId?: string;
  organizationName?: string;
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

export interface FacilityForSuggestion {
  id: number;
  name: string;
  type: string;
  building: string;
  floor: string;
  capacity: number;
  description: string;
  imageUrl: string;
  status: string;
}

export interface SuggestedFacilities {
  unavailableFacility: FacilityForSuggestion;
  requestedDate: string;
  requestedStartTime: string;
  requestedEndTime: string;
  reason: string;
  suggestedFacilities: FacilityForSuggestion[];
}

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private apiUrl = '/api/reservations';

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

  markAsReturned(id: number): Observable<ApiResponse<Reservation>> {
    return this.http.put<ApiResponse<Reservation>>(`${this.apiUrl}/${id}/return`, null);
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

  getSuggestedFacilities(facilityId: number, date: string, startTime: string, endTime: string, expectedCapacity?: number): Observable<ApiResponse<SuggestedFacilities>> {
    let url = `${this.apiUrl}/suggestions?facilityId=${facilityId}&date=${date}&startTime=${startTime}&endTime=${endTime}`;
    if (expectedCapacity != null) {
      url += `&expectedCapacity=${expectedCapacity}`;
    }
    return this.http.get<ApiResponse<SuggestedFacilities>>(url);
  }
}

