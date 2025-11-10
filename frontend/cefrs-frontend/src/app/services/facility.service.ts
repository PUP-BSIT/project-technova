import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface FacilityDTO {
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

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

@Injectable({
    providedIn: 'root'
})
export class FacilityService {
    private apiUrl = 'http://localhost:8080/api/facilities';

    constructor(private http: HttpClient) { }

    private getHeaders(): HttpHeaders {
        const token = localStorage.getItem('accessToken');
        return new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        });
    }

    // Get all facilities
    getAllFacilities(): Observable<FacilityDTO[]> {
        return this.http.get<ApiResponse<FacilityDTO[]>>(this.apiUrl, {
            headers: this.getHeaders()
        }).pipe(map(response => response.data));
    }

    // Get available facilities
    getAvailableFacilities(): Observable<FacilityDTO[]> {
        return this.http.get<ApiResponse<FacilityDTO[]>>(`${this.apiUrl}/available`, {
            headers: this.getHeaders()
        }).pipe(map(response => response.data));
    }

    // Get facility by ID
    getFacilityById(id: number): Observable<FacilityDTO> {
        return this.http.get<ApiResponse<FacilityDTO>>(`${this.apiUrl}/${id}`, {
            headers: this.getHeaders()
        }).pipe(map(response => response.data));
    }

    // Search facilities
    searchFacilities(name: string): Observable<FacilityDTO[]> {
        return this.http.get<ApiResponse<FacilityDTO[]>>(`${this.apiUrl}/search?name=${name}`, {
            headers: this.getHeaders()
        }).pipe(map(response => response.data));
    }

    // Get facilities by type
    getFacilitiesByType(type: string): Observable<FacilityDTO[]> {
        return this.http.get<ApiResponse<FacilityDTO[]>>(`${this.apiUrl}/type/${type}`, {
            headers: this.getHeaders()
        }).pipe(map(response => response.data));
    }

    // Create facility
    createFacility(facility: Partial<FacilityDTO>): Observable<FacilityDTO> {
        return this.http.post<ApiResponse<FacilityDTO>>(this.apiUrl, facility, {
            headers: this.getHeaders()
        }).pipe(map(response => response.data));
    }

    // Update facility
    updateFacility(id: number, facility: Partial<FacilityDTO>): Observable<FacilityDTO> {
        return this.http.put<ApiResponse<FacilityDTO>>(`${this.apiUrl}/${id}`, facility, {
            headers: this.getHeaders()
        }).pipe(map(response => response.data));
    }

    // Delete facility
    deleteFacility(id: number): Observable<void> {
        return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`, {
            headers: this.getHeaders()
        }).pipe(map(() => undefined));
    }
}