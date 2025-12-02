import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { AuthService } from '../../../services/auth';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-org-change-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './org-change-password.html',
  styleUrls: ['./org-change-password.scss']
})
export class OrgChangePasswordComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
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

    this.authService.changePassword(this.passwordForm.value).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.successMessage = 'Password changed successfully.';
        this.passwordForm.reset();
        this.isFormDirty = false;
        
        // Auto-redirect after successful password change without logging out
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
    this.router.navigate(['/org-dashboard', 'settings', 'profile']);
  }

  // Password validation
  passwordStrengthValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const value = control.value;
    if (!value) {
      return null;
    }

    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumeric = /[0-9]/.test(value);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(value);
    
    const passwordValid = hasUpperCase && hasLowerCase && hasNumeric && hasSpecial;
    
    return !passwordValid ? { 'passwordStrength': true } : null;
  }

  passwordMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    
    return newPassword === confirmPassword ? null : { 'passwordMismatch': true };
  }

  displayFormErrors(): void {
    const controls = this.passwordForm.controls;
    
    for (const controlName in controls) {
      if (controls[controlName].invalid) {
        controls[controlName].markAsTouched();
      }
    }
  }

handlePasswordChangeError(err: HttpErrorResponse): void {
    if (err.status === 401) {
      this.errorMessage = 'Session expired or current password is incorrect. Please log in again.';
    } else if (err.status === 403) {
      this.errorMessage = 'You are not authorized to change this password.';
    } else if (err.status === 400 && err.error instanceof Blob) {
        // Handle Spring Boot text response in an Angular PATCH/PUT call
        const reader = new FileReader();
        reader.onload = () => {
             const errorText = reader.result as string;
             // Error text usually contains the exact error from the backend (e.g., "Current password is incorrect")
             this.errorMessage = errorText;
             console.error('Backend Error Response:', errorText);
        };
        reader.readAsText(err.error);
        
    } else if (err.error?.message) {
      this.errorMessage = err.error.message;
    } else {
      this.errorMessage = 'Failed to change password. Please try again later. (Status: ' + err.status + ')';
    }
  }
}