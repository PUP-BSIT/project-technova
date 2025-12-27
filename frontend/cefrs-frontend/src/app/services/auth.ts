import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

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

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Listen for storage changes from other tabs
    this.setupStorageListener();
  }

  private setupStorageListener(): void {
    window.addEventListener('storage', (event: StorageEvent) => {
      // This event only fires when storage changes in OTHER tabs
      if (event.key === 'accessToken') {
        if (event.newValue) {
          // Token added/updated in another tab - update auth state
          this.isAuthenticatedSubject.next(true);
        } else {
          // Token removed in another tab - logout this tab too
          this.isAuthenticatedSubject.next(false);
          const loginRoute = this.getRoleBasedLoginRoute();
          this.router.navigate([loginRoute], { replaceUrl: true });
        }
      }
    });
  }

  register(userData: any): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/register`, userData).pipe(
      tap((response: LoginResponse) => {
        if (response.accessToken) {
          this.storeTokens(response, true); // Default remember me to true
          this.isAuthenticatedSubject.next(true);
        }
      }),
      catchError((error) => {
        console.error('Registration error:', error);
        return throwError(() => error);
      })
    );
  }

  login(email: string, password: string, rememberMe: boolean = true): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap((response: LoginResponse) => {
        if (response.accessToken) {
          this.storeTokens(response, rememberMe);
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
    // Store the current role before clearing for redirect purposes
    const currentRole = this.getUserRole();
    if (currentRole) {
      // Store in both storages for cross-tab consistency
      localStorage.setItem('lastKnownRole', currentRole);
      sessionStorage.setItem('lastKnownRole', currentRole);
    }
    
    // Clear from both localStorage and sessionStorage
    ['accessToken', 'refreshToken', 'userId', 'role'].forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
    this.isAuthenticatedSubject.next(false);
  }

  getUserProfile(): Observable<UserProfile> {
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

  private storeTokens(response: LoginResponse, rememberMe: boolean): void {
    const storage = rememberMe ? localStorage : sessionStorage;

    storage.setItem('accessToken', response.accessToken);
    storage.setItem('refreshToken', response.refreshToken);
    storage.setItem('userId', response.userId.toString());
    storage.setItem('role', response.role);
    // Update lastKnownRole on successful login
    storage.setItem('lastKnownRole', response.role);
  }

  private hasToken(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    // Check both storages
    return localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
  }

  getUserRole(): string | null {
    return localStorage.getItem('role') || sessionStorage.getItem('role');
  }

  getLastKnownRole(): string | null {
    return localStorage.getItem('lastKnownRole') || sessionStorage.getItem('lastKnownRole');
  }

  getRoleBasedLoginRoute(): string {
    // First try to get current role, then fall back to last known role
    const role = this.getUserRole() || this.getLastKnownRole();
    
    if (role === 'ADMIN' || role === 'ADMINISTRATOR' || role === 'SUPER_ADMIN') {
      return '/admin-login';
    } else if (role === 'CAMPUS_ORGANIZATION') {
      return '/org-login';
    } else if (role === 'STUDENT') {
      return '/login';
    } else {
      // Default to role selection page if no role is known
      return '/select-role';
    }
  }

  getUserId(): string | null {
    return localStorage.getItem('userId') || sessionStorage.getItem('userId');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  checkPhoneNumberAvailability(phoneNumber: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/check-phone?phoneNumber=${phoneNumber}`).pipe(
      tap((isAvailable) => {
        console.log('Phone availability:', isAvailable);
      }),
      catchError((error) => {
        console.error('Error checking phone availability:', error);
        return throwError(() => error);
      })
    );
  }

  checkStudentIdAvailability(studentId: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/check-student-id?studentId=${encodeURIComponent(studentId)}`).pipe(
      tap((isAvailable) => {
        console.log('Student ID availability:', isAvailable);
      }),
      catchError((error) => {
        console.error('Error checking Student ID availability:', error);
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
        console.log('Forgot password response:', response);
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
        console.log('Reset password response:', response);
      }),
      catchError((error) => {
        console.error('Reset password error:', error);
        return throwError(() => error);
      })
    );
  }
}