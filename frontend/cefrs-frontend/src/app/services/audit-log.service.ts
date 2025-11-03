import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AuditLog {
  logId: number;
  userId: number;
  userEmail?: string;
  userName?: string;
  actionType: string;
  tableName: string;
  recordId: number;
  oldValues?: string;
  newValues?: string;
  ipAddress?: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuditLogService {
  private apiUrl = 'http://localhost:8080/api/audit';

  constructor(private http: HttpClient) {}

  getMyAuditLogs(): Observable<AuditLog[]> {
    return this.http.get<AuditLog[]>(`${this.apiUrl}/my-logs`);
  }

  getAllAuditLogs(): Observable<AuditLog[]> {
    return this.http.get<AuditLog[]>(`${this.apiUrl}/all`);
  }

  getAuditLogsByAction(actionType: string): Observable<AuditLog[]> {
    return this.http.get<AuditLog[]>(`${this.apiUrl}/action/${actionType}`);
  }

  getAuditLogsByTable(tableName: string): Observable<AuditLog[]> {
    return this.http.get<AuditLog[]>(`${this.apiUrl}/table/${tableName}`);
  }
}

