import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { ProfileService } from '../../services/profile.service';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { SidebarComponent } from '../sidebar/sidebar';

@Component({
  selector: 'app-student-change-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SidebarComponent],
  templateUrl: './student-change-password.html',
  styleUrls: ['./student-change-password.scss']
})
export class StudentChangePasswordComponent implements OnInit {
  private fb = inject(FormBuilder);
  private profileService = inject(ProfileService);
  private router = inject(Router);

  passwordForm!: FormGroup;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';
  isFormDirty = false;
  
  // Password visibility toggles
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  ngOnInit(): void {
    this.passwordForm = this.fb.group({
      currentPassword: this.fb.control('', {
        nonNullable: true,
        validators: [Validators.required]
      }),
      newPassword: this.fb.control('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(6), this.passwordStrengthValidator]
      }),
      confirmPassword: this.fb.control('', {
        nonNullable: true,
        validators: [Validators.required]
      })
    }, { validators: this.passwordMatchValidator });

    // Track form changes to show/hide cancel button
    this.passwordForm.valueChanges.subscribe(() => {
      this.isFormDirty = this.passwordForm.dirty;
    });
  }

  changePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      this.displayFormErrors();
      return;
    }

    const { currentPassword, newPassword } = this.passwordForm.value;
    
    // Additional validation
    if (currentPassword === newPassword) {
      this.errorMessage = 'New password must be different from current password.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Get user ID from stored auth info
    const userIdStr = localStorage.getItem('userId');
    const userId = userIdStr ? parseInt(userIdStr, 10) : NaN;
    if (!userId || Number.isNaN(userId)) {
      this.isSubmitting = false;
      this.errorMessage = 'Unable to determine user. Please try again.';
      return;
    }

    this.profileService.changePassword(userId, currentPassword, newPassword).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.successMessage = res.message || 'Password changed successfully.';
        this.passwordForm.reset();
        this.isFormDirty = false;
        
        // Auto-redirect after successful password change
        setTimeout(() => {
          this.goBackToProfile();
        }, 2000);
      },
      error: (err: HttpErrorResponse) => {
        this.isSubmitting = false;
        this.handlePasswordChangeError(err);
      }
    });
  }

  // Password visibility toggle methods
  toggleCurrentPasswordVisibility(): void {
    this.showCurrentPassword = !this.showCurrentPassword;
  }

  toggleNewPasswordVisibility(): void {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  // getter for template readability
  get f() {
    return this.passwordForm.controls;
  }

  // Navigation method
  goBackToProfile(): void {
    // Reset form if user cancels
    if (this.isFormDirty) {
      this.passwordForm.reset();
      this.isFormDirty = false;
    }
    this.router.navigate(['/profile']);
  }

  onViewChanged(view: string): void {
    // Handle view changes from sidebar
    console.log('View changed to:', view);
    
    // Navigate based on the view
    switch (view) {
      case 'dashboard':
        this.router.navigate(['/student-dashboard']);
        break;
      case 'facilities':
      case 'equipment':
      case 'requests':
        this.router.navigate(['/student-dashboard']);
        break;
      case 'settings':
        this.router.navigate(['/profile']);
        break;
    }
  }

  // Custom validators
  passwordStrengthValidator(control: AbstractControl): {[key: string]: any} | null {
    const value = control.value;
    if (!value) return null;
    
    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumbers = /\d/.test(value);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
    
    const valid = hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
    return valid ? null : { weakPassword: true };
  }

  passwordMatchValidator(control: AbstractControl): {[key: string]: any} | null {
    const newPassword = control.get('newPassword');
    const confirmPassword = control.get('confirmPassword');
    
    if (!newPassword || !confirmPassword) return null;
    
    return newPassword.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  // Error handling methods
  displayFormErrors(): void {
    const errors = [];
    
    if (this.passwordForm.get('currentPassword')?.hasError('required')) {
      errors.push('Current password is required.');
    }
    
    if (this.passwordForm.get('newPassword')?.hasError('required')) {
      errors.push('New password is required.');
    } else if (this.passwordForm.get('newPassword')?.hasError('minlength')) {
      errors.push('New password must be at least 6 characters.');
    } else if (this.passwordForm.get('newPassword')?.hasError('weakPassword')) {
      errors.push('Password must contain uppercase, lowercase, numbers, and special characters.');
    }
    
    if (this.passwordForm.get('confirmPassword')?.hasError('required')) {
      errors.push('Please confirm your password.');
    }
    
    if (this.passwordForm.hasError('passwordMismatch')) {
      errors.push('New password and confirmation do not match.');
    }
    
    this.errorMessage = errors.join(' ');
  }

  handlePasswordChangeError(err: HttpErrorResponse): void {
    console.error('Password change error:', err);
    
    switch (err.status) {
      case 400:
        this.errorMessage = err.error?.message || 'Invalid password data.';
        break;
      case 401:
        this.errorMessage = 'Current password is incorrect.';
        break;
      case 403:
        this.errorMessage = 'You do not have permission to change this password.';
        break;
      case 404:
        this.errorMessage = 'User not found.';
        break;
      case 500:
        this.errorMessage = 'Server error. Please try again later.';
        break;
      default:
        this.errorMessage = err.error?.message || 'Failed to change password. Please try again.';
    }
  }
}
