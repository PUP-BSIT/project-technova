import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/user'; 

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile`, {
      headers: this.getHeaders()
    });
  }

  updateProfile(data: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/update`, data, {
      headers: this.getHeaders()
    });
  }

  changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string
  ): Observable<any> {
    const payload = { currentPassword, newPassword };
    return this.http.post(`${this.apiUrl}/${userId}/change-password`, payload, {
      headers: this.getHeaders()
    });
  }

  uploadProfileImage(userId: number, file: File): Observable<any> {
    const token = localStorage.getItem('token') || '';
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(`${this.apiUrl}/${userId}/upload-image`, formData, {
      headers
    });
  }
}
