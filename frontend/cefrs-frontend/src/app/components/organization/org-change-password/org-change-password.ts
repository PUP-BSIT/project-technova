import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { ProfileService } from '../../../services/profile.service';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { OrgSidebarComponent } from '../org-sidebar/org-sidebar';

@Component({
  selector: 'app-org-change-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, OrgSidebarComponent],
  templateUrl: './org-change-password.html',
  styleUrls: ['./org-change-password.scss']
})
export class OrgChangePasswordComponent implements OnInit {
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
    this.router.navigate(['/org-profile']);
  }

  // Handle view changes from sidebar
  onViewChanged(view: string): void {
    console.log('View changed to:', view);
    
    // Ensure proper display when navigating
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 50);
    
    // Navigate based on the view
    switch (view) {
      case 'dashboard':
        this.router.navigate(['/org-dashboard']);
        break;
      case 'facilities':
      case 'requests':
        this.router.navigate(['/org-dashboard']);
        break;
      case 'settings':
        this.router.navigate(['/org-profile']);
        break;
    }
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
      this.errorMessage = 'Current password is incorrect.';
    } else if (err.status === 403) {
      this.errorMessage = 'You are not authorized to change this password.';
    } else if (err.error?.message) {
      this.errorMessage = err.error.message;
    } else {
      this.errorMessage = 'Failed to change password. Please try again later.';
    }
  }
}