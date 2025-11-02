import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

interface Facility {
    id: number;
    name: string;
    type: string;
    capacity: number;
    location: string;
    description: string;
    imageUrl: string;
    status: string;
}

@Injectable({
    providedIn: 'root'
})
export class FacilityService {
    private apiUrl = 'http://localhost:8080/api/facilities';

    constructor(private http: HttpClient) { }

    getAllFacilities(): Observable<ApiResponse<Facility[]>> {
        return this.http.get<ApiResponse<Facility[]>>(this.apiUrl);
    }

    getAvailableFacilities(): Observable<ApiResponse<Facility[]>> {
        return this.http.get<ApiResponse<Facility[]>>(`${this.apiUrl}/available`);
    }

    createReservation(userId: number, request: any): Observable<ApiResponse<any>> {
        return this.http.post<ApiResponse<any>>(`http://localhost:8080/api/reservations/user/${userId}`, request);
    }
}