import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  color: string;
  extendedProps: {
    type: 'facility' | 'equipment';
    status: string;
    userName: string;
    userEmail: string;
    quantity?: number;
    purpose?: string;
    adminNotes?: string;
  };
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface FacilityReservation {
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
  adminNotes: string;
  createdAt: string;
}

interface EquipmentBorrowing {
  id: number;
  userId: number;
  userName: string;
  equipmentId: number;
  equipmentName: string;
  quantity: number;
  borrowDate: string;
  expectedReturnDate: string;
  actualReturnDate: string;
  purpose: string;
  status: string;
  adminNotes: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('accessToken');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // Get all calendar events (facility reservations + equipment borrowings)
  getAllCalendarEvents(): Observable<CalendarEvent[]> {
    const facilities$ = this.http.get<ApiResponse<FacilityReservation[]>>(
      `${this.apiUrl}/reservations`,
      { headers: this.getHeaders() }
    );

    const equipment$ = this.http.get<ApiResponse<EquipmentBorrowing[]>>(
      `${this.apiUrl}/equipment-borrowing`,
      { headers: this.getHeaders() }
    );

    return forkJoin([facilities$, equipment$]).pipe(
      map(([facilityRes, equipmentRes]) => {
        const facilityEvents = this.convertFacilityToEvents(facilityRes.data);
        const equipmentEvents = this.convertEquipmentToEvents(equipmentRes.data);
        return [...facilityEvents, ...equipmentEvents];
      })
    );
  }

  // Convert facility reservations to calendar events
  private convertFacilityToEvents(reservations: FacilityReservation[]): CalendarEvent[] {
    return reservations.map(res => ({
      id: `facility-${res.id}`,
      title: `${res.facilityName} - ${res.userName}`,
      start: `${res.reservationDate}T${res.startTime}`,
      end: `${res.reservationDate}T${res.endTime}`,
      color: this.getStatusColor(res.status),
      extendedProps: {
        type: 'facility',
        status: res.status,
        userName: res.userName,
        userEmail: '',
        purpose: res.purpose,
        adminNotes: res.adminNotes
      }
    }));
  }

  // Convert equipment borrowings to calendar events
  private convertEquipmentToEvents(borrowings: EquipmentBorrowing[]): CalendarEvent[] {
    return borrowings.map(borrow => ({
      id: `equipment-${borrow.id}`,
      title: `${borrow.equipmentName} (x${borrow.quantity}) - ${borrow.userName}`,
      start: borrow.borrowDate,
      end: borrow.actualReturnDate || borrow.expectedReturnDate,
      color: this.getStatusColor(borrow.status),
      extendedProps: {
        type: 'equipment',
        status: borrow.status,
        userName: borrow.userName,
        userEmail: '',
        quantity: borrow.quantity,
        purpose: borrow.purpose,
        adminNotes: borrow.adminNotes
      }
    }));
  }

  // Get color based on status
  private getStatusColor(status: string): string {
    const colorMap: { [key: string]: string } = {
      'APPROVED': '#10b981',    // Green
      'PENDING': '#f59e0b',     // Orange/Yellow
      'REJECTED': '#ef4444',    // Red
      'BORROWED': '#3b82f6',    // Blue
      'RETURNED': '#6b7280',    // Gray
      'OVERDUE': '#dc2626'      // Dark Red
    };
    return colorMap[status] || '#6b7280';
  }

  // Approve facility reservation
  approveFacilityReservation(id: number, adminId: number, notes: string): Observable<any> {
    return this.http.put<ApiResponse<any>>(
      `${this.apiUrl}/reservations/${id}/status?adminId=${adminId}`,
      { status: 'APPROVED', adminNotes: notes },
      { headers: this.getHeaders() }
    );
  }

  // Reject facility reservation
  rejectFacilityReservation(id: number, adminId: number, notes: string): Observable<any> {
    return this.http.put<ApiResponse<any>>(
      `${this.apiUrl}/reservations/${id}/status?adminId=${adminId}`,
      { status: 'REJECTED', adminNotes: notes },
      { headers: this.getHeaders() }
    );
  }

  // Approve equipment borrowing
  approveEquipmentBorrowing(id: number, adminId: number, notes: string): Observable<any> {
    return this.http.put<ApiResponse<any>>(
      `${this.apiUrl}/equipment-borrowing/${id}/status?adminId=${adminId}`,
      { status: 'APPROVED', adminNotes: notes },
      { headers: this.getHeaders() }
    );
  }

  // Reject equipment borrowing
  rejectEquipmentBorrowing(id: number, adminId: number, notes: string): Observable<any> {
    return this.http.put<ApiResponse<any>>(
      `${this.apiUrl}/equipment-borrowing/${id}/status?adminId=${adminId}`,
      { status: 'REJECTED', adminNotes: notes },
      { headers: this.getHeaders() }
    );
  }

  // Delete facility reservation
  deleteFacilityReservation(id: number, userId: number): Observable<any> {
    return this.http.delete<ApiResponse<any>>(
      `${this.apiUrl}/reservations/${id}/cancel?userId=${userId}`,
      { headers: this.getHeaders() }
    );
  }

  // Delete equipment borrowing
  deleteEquipmentBorrowing(id: number): Observable<any> {
    return this.http.delete<ApiResponse<any>>(
      `${this.apiUrl}/equipment-borrowing/${id}`,
      { headers: this.getHeaders() }
    );
  }
}