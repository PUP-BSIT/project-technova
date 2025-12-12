import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HttpClientModule],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.scss']
})
export class ForgotPassword implements OnInit {
  currentStep: number = 1;
  
  // Step 1 - Email/Phone
  contactMethod: 'email' | 'phone' = 'email';
  emailOrPhone: string = '';
  
  // Step 2 - Verification
  verificationCode: string = '';
  resendTimer: number = 60;
  canResend: boolean = false;
  private resendInterval: any;
  
  // Step 3 - New Password
  newPassword: string = '';
  confirmPassword: string = '';
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  
  // Error handling
  errorMessage: string = '';
  
  // Loading states
  isLoading: boolean = false;

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    // Initialize component
  }

  ngOnDestroy(): void {
    if (this.resendInterval) {
      clearInterval(this.resendInterval);
    }
  }

  // Step 1 Methods
  toggleContactMethod(method: 'email' | 'phone'): void {
    if (this.currentStep > 1 || this.isLoading) {
      return;
    }
    this.contactMethod = method;
    this.emailOrPhone = '';
    this.errorMessage = '';
  }

  validateEmailOrPhone(): boolean {
    this.errorMessage = '';
    
    if (!this.emailOrPhone.trim()) {
      this.errorMessage = `Please enter your ${this.contactMethod}`;
      return false;
    }

    if (this.contactMethod === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.emailOrPhone)) {
        this.errorMessage = 'Please enter a valid email address';
        return false;
      }
    } else {
      const phoneRegex = /^[0-9]{10,11}$/;
      if (!phoneRegex.test(this.emailOrPhone.replace(/\D/g, ''))) {
        this.errorMessage = 'Please enter a valid phone number';
        return false;
      }
    }

    return true;
  }

  async sendVerificationCode(): Promise<void> {
    if (!this.validateEmailOrPhone()) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      await this.http.post<any>('/api/auth/forgot-password', { email: this.emailOrPhone })
        .pipe(catchError(err => {
          return throwError(() => err);
        }))
        .toPromise();

      this.currentStep = 2;
      this.startResendTimer();
    } catch (error: any) {
      this.errorMessage = error?.error?.message || 'Failed to send verification code. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }

  // Step 2 Methods
  startResendTimer(): void {
    this.resendTimer = 60;
    this.canResend = false;

    this.resendInterval = setInterval(() => {
      this.resendTimer--;
      if (this.resendTimer <= 0) {
        this.canResend = true;
        clearInterval(this.resendInterval);
      }
    }, 1000);
  }

  async resendCode(): Promise<void> {
    if (!this.canResend) return;

    this.isLoading = true;
    this.errorMessage = '';

    try {
      await this.http.post<any>('/api/auth/forgot-password', { email: this.emailOrPhone }).toPromise();
      this.startResendTimer();
    } catch (error: any) {
      this.errorMessage = error?.error?.message || 'Failed to resend code. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }

  validateVerificationCode(): boolean {
    this.errorMessage = '';

    if (!this.verificationCode.trim()) {
      this.errorMessage = 'Please enter the verification code';
      return false;
    }

    if (this.verificationCode.length !== 6) {
      this.errorMessage = 'Verification code must be 6 digits';
      return false;
    }

    return true;
  }

  async verifyCode(): Promise<void> {
    // In this demo flow we only validate presence and length, then advance.
    if (!this.validateVerificationCode()) {
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';

    try {
      await this.http.post<any>('/api/auth/validate-reset-token', { token: this.verificationCode }).toPromise();
      this.currentStep = 3;
    } catch (error: any) {
      this.errorMessage = error?.error?.message || 'Invalid verification code';
    } finally {
      this.isLoading = false;
    }
  }

  // Step 3 Methods
  togglePasswordVisibility(field: 'password' | 'confirm'): void {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  async resetPassword(): Promise<void> {
    this.errorMessage = '';

    if (!this.newPassword) {
      this.errorMessage = 'Please enter a new password';
      return;
    }

    if (this.newPassword.length < 8) {
      this.errorMessage = 'Password must be at least 8 characters long';
      return;
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(this.newPassword)) {
      this.errorMessage = 'Password must contain uppercase, lowercase, and numbers';
      return;
    }

    if (!this.confirmPassword) {
      this.errorMessage = 'Please confirm your password';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      await this.http.post<any>('/api/auth/reset-password', { token: this.verificationCode, newPassword: this.newPassword }).toPromise();
      this.router.navigate(['/login'], { 
        queryParams: { passwordReset: 'success' } 
      });
    } catch (error: any) {
      this.errorMessage = error?.error?.message || 'Failed to reset password. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }

  // Navigation Methods
  goBack(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.errorMessage = '';
    } else {
      this.router.navigate(['/login']);
    }
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  goToPreviousPage(): void {
    window.history.back();
  }

  // Utility Methods
  private simulateApiCall(delay: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(), delay);
    });
  }

  // Format phone number as user types
  formatPhoneNumber(event: any): void {
    if (this.contactMethod === 'phone') {
      let value = event.target.value.replace(/\D/g, '');
      if (value.length > 11) {
        value = value.substr(0, 11);
      }
      this.emailOrPhone = value;
    }
  }

  // Auto-format verification code
  formatVerificationCode(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 6) {
      value = value.substr(0, 6);
    }
    this.verificationCode = value;
  }
}