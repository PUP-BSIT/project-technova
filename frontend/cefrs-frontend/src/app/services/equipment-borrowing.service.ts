import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface BorrowingRequest {
  equipmentId: number;
  quantity: number;
  borrowDate: string; // Format: "YYYY-MM-DD"
  expectedReturnDate: string; // Format: "YYYY-MM-DD"
  purpose: string;
}

export interface EquipmentBorrowing {
  id: number;
  userId: number;
  userName: string;
  equipmentId: number;
  equipmentName: string;
  quantity: number;
  borrowDate: string;
  expectedReturnDate: string;
  actualReturnDate?: string;
  purpose: string;
  status: string;
  adminNotes?: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class EquipmentBorrowingService {
  private apiUrl = 'http://localhost:8080/api/equipment-borrowing';

  constructor(private http: HttpClient) { }

  createBorrowing(request: BorrowingRequest): Observable<ApiResponse<EquipmentBorrowing>> {
    return this.http.post<ApiResponse<EquipmentBorrowing>>(`${this.apiUrl}`, request);
  }

  getMyBorrowings(): Observable<ApiResponse<EquipmentBorrowing[]>> {
    return this.http.get<ApiResponse<EquipmentBorrowing[]>>(`${this.apiUrl}/me`);
  }

  getBorrowingById(id: number): Observable<ApiResponse<EquipmentBorrowing>> {
    return this.http.get<ApiResponse<EquipmentBorrowing>>(`${this.apiUrl}/${id}`);
  }

  // Admin methods
  getAllBorrowings(): Observable<ApiResponse<EquipmentBorrowing[]>> {
    return this.http.get<ApiResponse<EquipmentBorrowing[]>>(`${this.apiUrl}`);
  }

  getPendingBorrowings(): Observable<ApiResponse<EquipmentBorrowing[]>> {
    return this.http.get<ApiResponse<EquipmentBorrowing[]>>(`${this.apiUrl}/pending`);
  }

  updateBorrowingStatus(
    id: number,
    status: string,
    adminNotes?: string,
    actualReturnDate?: string
  ): Observable<ApiResponse<EquipmentBorrowing>> {
    const body: any = { status, adminNotes };
    if (actualReturnDate) {
      body.actualReturnDate = actualReturnDate;
    }
    const adminId = localStorage.getItem('userId');
    const url = adminId
      ? `${this.apiUrl}/${id}/status?adminId=${adminId}`
      : `${this.apiUrl}/${id}/status`;
    return this.http.put<ApiResponse<EquipmentBorrowing>>(url, body);
  }
}

