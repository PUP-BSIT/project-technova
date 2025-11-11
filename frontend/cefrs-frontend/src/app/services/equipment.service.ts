import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface EquipmentDTO {
  id: number;
  name: string;
  category: string;
  quantityTotal: number;
  quantityAvailable: number;
  description: string;
  imageUrl: string;
  status: string;
}

export interface EquipmentRequestDTO {
  name: string;
  category: string;
  quantityTotal: number;
  description: string;
  imageUrl: string;
  status?: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class EquipmentService {
  private apiUrl = 'http://localhost:8080/api/equipment';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('accessToken');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // Get all equipment
  getAllEquipment(): Observable<EquipmentDTO[]> {
    return this.http.get<ApiResponse<EquipmentDTO[]>>(this.apiUrl, {
      headers: this.getHeaders()
    }).pipe(map(response => response.data));
  }

  // Get available equipment
  getAvailableEquipment(): Observable<EquipmentDTO[]> {
    return this.http.get<ApiResponse<EquipmentDTO[]>>(`${this.apiUrl}/available`, {
      headers: this.getHeaders()
    }).pipe(map(response => response.data));
  }

  // Get equipment by ID
  getEquipmentById(id: number): Observable<EquipmentDTO> {
    return this.http.get<ApiResponse<EquipmentDTO>>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    }).pipe(map(response => response.data));
  }

  // Search equipment
  searchEquipment(name: string): Observable<EquipmentDTO[]> {
    return this.http.get<ApiResponse<EquipmentDTO[]>>(`${this.apiUrl}/search?name=${name}`, {
      headers: this.getHeaders()
    }).pipe(map(response => response.data));
  }

  // Create equipment
  createEquipment(equipment: EquipmentRequestDTO): Observable<EquipmentDTO> {
    return this.http.post<ApiResponse<EquipmentDTO>>(this.apiUrl, equipment, {
      headers: this.getHeaders()
    }).pipe(map(response => response.data));
  }

  // Update equipment
  updateEquipment(id: number, equipment: EquipmentRequestDTO): Observable<EquipmentDTO> {
    return this.http.put<ApiResponse<EquipmentDTO>>(`${this.apiUrl}/${id}`, equipment, {
      headers: this.getHeaders()
    }).pipe(map(response => response.data));
  }

  // Delete equipment
  deleteEquipment(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    }).pipe(map(() => undefined));
  }

  // Request equipment borrowing
  requestEquipment(userId: number, request: any): Observable<any> {
    return this.http.post<ApiResponse<any>>(
      `http://localhost:8080/api/equipment-borrowing/user/${userId}`,
      request,
      { headers: this.getHeaders() }
    ).pipe(map(response => response.data));
  }
}