import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  userId: number;
  role: string;
  message: string;
}

interface UserProfile {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: string;
  organizationName: string;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = '/api/auth';
  private userApiUrl = '/api/user';

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  public isAuthenticated = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient) {
  }

  register(userData: any): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/register`, userData).pipe(
      tap((response: LoginResponse) => {
        
        if (response.accessToken) {
          this.storeTokens(response);
          this.isAuthenticatedSubject.next(true);
        }
      }),
      catchError((error) => {
        console.error('Registration error:', error);
        return throwError(() => error);
      })
    );
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap((response: LoginResponse) => {
        
        if (response.accessToken) {
          this.storeTokens(response);
          this.isAuthenticatedSubject.next(true);
        }
      }),
      catchError((error) => {
        console.error('Login error:', error);
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    this.isAuthenticatedSubject.next(false);
  }

  getUserProfile(): Observable<UserProfile> {
    // Note: The ProfileService (which you also provided) calls the same endpoint.
    // It's usually better to have only one service responsible for a resource (User/Profile).
    // If you plan to use this one instead of ProfileService, ensure you update
    // the Dashboard and Profile components to use this method.
    return this.http.get<UserProfile>(`${this.userApiUrl}/profile`).pipe(
      tap((profile: UserProfile) => {
        
      }),
      catchError((error) => {
        console.error('Error fetching profile:', error);
        return throwError(() => error);
      })
    );
  }

  updateUserProfile(userData: any): Observable<UserProfile> {
    return this.http.patch<UserProfile>(`${this.userApiUrl}/update`, userData).pipe(
      tap((profile: UserProfile) => {
        
      }),
      catchError((error) => {
        console.error('Profile update error:', error);
        return throwError(() => error);
      })
    );
  }

  private storeTokens(response: LoginResponse): void {
    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);
    localStorage.setItem('userId', response.userId.toString());
    localStorage.setItem('role', response.role);
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  getToken(): string | null {
    // Correctly returns the access token key: 'accessToken'
    return localStorage.getItem('accessToken');
  }

  getUserRole(): string | null {
    return localStorage.getItem('role');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  checkPhoneNumberAvailability(phoneNumber: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/check-phone?phoneNumber=${phoneNumber}`).pipe(
      tap((isAvailable) => {
        
      }),
      catchError((error) => {
        console.error('Error checking phone availability:', error);
        return throwError(() => error);
      })
    );
  }

  changePassword(payload: { currentPassword: string; newPassword: string; confirmPassword: string }): Observable<any> {
    return this.http.patch(`${this.userApiUrl}/change-password`, payload, { responseType: 'text' });
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email }).pipe(
      tap((response) => {
        
      }),
      catchError((error) => {
        console.error('Forgot password error:', error);
        return throwError(() => error);
      })
    );
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, { token, newPassword }).pipe(
      tap((response) => {
        
      }),
      catchError((error) => {
        console.error('Reset password error:', error);
        return throwError(() => error);
      })
    );
  }
}
