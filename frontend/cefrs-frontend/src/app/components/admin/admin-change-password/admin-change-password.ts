import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-admin-change-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-change-password.html',
  styleUrls: ['./admin-change-password.scss']
})
export class AdminChangePasswordComponent implements OnInit {
  form!: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator // Add custom validator
    });
  }

  // Custom validator to check if passwords match
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPassword = control.get('newPassword');
    const confirmPassword = control.get('confirmPassword');

    if (!newPassword || !confirmPassword) {
      return null;
    }

    if (confirmPassword.value === '') {
      return null;
    }

    return newPassword.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  // Check if passwords match for green border
  get passwordsMatch(): boolean {
    const newPassword = this.form.get('newPassword')?.value;
    const confirmPassword = this.form.get('confirmPassword')?.value;
    return confirmPassword !== '' && newPassword === confirmPassword;
  }

  // Check if passwords don't match for red border
  get passwordsDontMatch(): boolean {
    const confirmPassword = this.form.get('confirmPassword');
    return !!(confirmPassword?.touched &&
      confirmPassword?.value !== '' &&
      this.form.hasError('passwordMismatch'));
  }

  toggleCurrentPassword(): void {
    this.showCurrentPassword = !this.showCurrentPassword;
  }

  toggleNewPassword(): void {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  submit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    // Mark all fields as touched to show validation error
    Object.keys(this.form.controls).forEach(key => {
      this.form.get(key)?.markAsTouched();
    });

    if (this.form.invalid) {
      if (this.form.hasError('passwordMismatch')) {
        this.errorMessage = 'New password and confirmation do not match.';
      } else {
        this.errorMessage = 'Please complete all required fields correctly.';
      }
      return;
    }

    const payload = {
      currentPassword: this.form.get('currentPassword')?.value,
      newPassword: this.form.get('newPassword')?.value,
      confirmPassword: this.form.get('confirmPassword')?.value
    };

    this.isSubmitting = true;

    // Real API call
    this.authService.changePassword(payload).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.successMessage = 'Password updated successfully.';
        this.errorMessage = '';
        this.form.reset();

        // Navigate back after 2 seconds
        setTimeout(() => {
          this.router.navigate(['/admin-dashboard/settings/profile']);
        }, 2000);
      },
      error: (error) => {
        console.error('Change password error:', error);
        this.isSubmitting = false;

        let errorMsg = 'Failed to change password. Please try again.';

        if (error.error) {
          if (typeof error.error === 'string') {
            errorMsg = error.error;
          }
          else if (error.error.message) {
            errorMsg = error.error.message;
          }
        }

        this.errorMessage = errorMsg;
        this.successMessage = '';
      }
    });
  }

  goBackToProfile(): void {
    this.router.navigate(['/admin-dashboard/settings/profile']);
  }
}