import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

interface Equipment {
    id: number;
    name: string;
    category: string;
    quantityTotal: number;
    quantityAvailable: number;
    description: string;
    imageUrl: string;
    status: string;
}

@Injectable({
    providedIn: 'root'
})
export class EquipmentService {
    private apiUrl = 'http://localhost:8080/api/equipment';

    constructor(private http: HttpClient) { }

    getAllEquipment(): Observable<ApiResponse<Equipment[]>> {
        return this.http.get<ApiResponse<Equipment[]>>(this.apiUrl);
    }

    getAvailableEquipment(): Observable<ApiResponse<Equipment[]>> {
        return this.http.get<ApiResponse<Equipment[]>>(`${this.apiUrl}/available`);
    }

    searchEquipment(name: string): Observable<ApiResponse<Equipment[]>> {
        return this.http.get<ApiResponse<Equipment[]>>(`${this.apiUrl}/search?name=${name}`);
    }

    requestEquipment(userId: number, request: any): Observable<ApiResponse<any>> {
        return this.http.post<ApiResponse<any>>(`http://localhost:8080/api/equipment-borrowing/user/${userId}`, request);
    }
}