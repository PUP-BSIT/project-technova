import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProfileService {
    private apiUrl = 'http://localhost:8080/api/user';

    constructor(private http: HttpClient) { }

    getProfile(): Observable<any> {
        return this.http.get(`${this.apiUrl}/profile`);
    }

    updateProfile(data: any): Observable<any> {
        return this.http.patch(`${this.apiUrl}/update`, data);
    }
}
