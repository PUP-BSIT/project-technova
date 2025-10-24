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
  private apiUrl = 'http://localhost:8080/api/auth';
  private userApiUrl = 'http://localhost:8080/api/user';

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  public isAuthenticated = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient) {
    console.log('AuthService initialized');
  }

  register(userData: any): Observable<LoginResponse> {
    console.log('Registering user:', userData);
    return this.http.post<LoginResponse>(`${this.apiUrl}/register`, userData).pipe(
      tap((response: LoginResponse) => {
        console.log('Registration successful:', response);
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
    console.log('Logging in user:', email);
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap((response: LoginResponse) => {
        console.log('Login successful:', response);
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
    console.log('Logging out user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    this.isAuthenticatedSubject.next(false);
  }

  getUserProfile(): Observable<UserProfile> {
    console.log('Fetching user profile');
    // Note: The ProfileService (which you also provided) calls the same endpoint.
    // It's usually better to have only one service responsible for a resource (User/Profile).
    // If you plan to use this one instead of ProfileService, ensure you update
    // the Dashboard and Profile components to use this method.
    return this.http.get<UserProfile>(`${this.userApiUrl}/profile`).pipe(
      tap((profile: UserProfile) => {
        console.log('User profile fetched:', profile);
      }),
      catchError((error) => {
        console.error('Error fetching profile:', error);
        return throwError(() => error);
      })
    );
  }

  updateUserProfile(userData: any): Observable<UserProfile> {
    console.log('Updating user profile:', userData);
    return this.http.patch<UserProfile>(`${this.userApiUrl}/update`, userData).pipe(
      tap((profile: UserProfile) => {
        console.log('Profile updated:', profile);
      }),
      catchError((error) => {
        console.error('Profile update error:', error);
        return throwError(() => error);
      })
    );
  }

  private storeTokens(response: LoginResponse): void {
    console.log('Storing tokens in localStorage');
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
}
