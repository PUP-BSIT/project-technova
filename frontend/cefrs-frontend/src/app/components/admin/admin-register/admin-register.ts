import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-admin-register',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './admin-register.html',
  styleUrl: './admin-register.scss'
})
export class AdminRegister {
  currentStep = 1;
  showPassword = false;
  showConfirmPassword = false;
  isLoading = false;
  errorMessage = '';

  registerForm: FormGroup;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.registerForm = this.fb.group(
      {
        firstName: ['', [Validators.required]],
        lastName: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        phoneNumber: ['', [Validators.required]],
        password: ['', [Validators.required, Validators.minLength(8), this.passwordValidator]],
        confirmPassword: ['', [Validators.required]]
      },
      { validators: this.passwordMatchValidator }
    );
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  nextStep() {
    if (this.currentStep === 1) {
      const firstName = this.registerForm.get('firstName');
      const lastName = this.registerForm.get('lastName');
      firstName?.markAsTouched();
      lastName?.markAsTouched();
      if (firstName?.invalid || lastName?.invalid) return;
    }
    if (this.currentStep === 2) {
      const email = this.registerForm.get('email');
      const phone = this.registerForm.get('phoneNumber');
      email?.markAsTouched();
      phone?.markAsTouched();
      if (email?.invalid || phone?.invalid) return;
    }
    this.currentStep++;
  }

  previousStep() {
    if (this.currentStep > 1) this.currentStep--;
  }

  submitForm() {
    this.registerForm.markAllAsTouched();

    if (this.registerForm.errors?.['passwordMismatch']) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }
    if (this.registerForm.get('password')?.errors?.['invalidPassword']) {
      this.errorMessage = 'Password must be at least 8 characters with uppercase, lowercase, number, and special character.';
      return;
    }
    if (this.registerForm.invalid) {
      this.errorMessage = 'Please fill in all required fields correctly.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const registerData = {
      firstName: this.registerForm.value.firstName,
      lastName: this.registerForm.value.lastName,
      email: this.registerForm.value.email,
      phoneNumber: this.registerForm.value.phoneNumber,
      password: this.registerForm.value.password,
      role: 'ADMINISTRATOR'
    };

    this.authService.register(registerData).subscribe({
      next: () => {
        this.isLoading = false;
        this.currentStep = 4;
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
      }
    });
  }

  goToDashboard() {
    this.router.navigate(['/admin-dashboard']);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.registerForm.get(fieldName);
    if (field?.errors?.['required']) return 'This field is required';
    if (field?.errors?.['email']) return 'Please enter a valid email address';
    if (field?.errors?.['minlength']) return `Minimum length is ${field.errors['minlength'].requiredLength} characters`;
    if (field?.errors?.['invalidPassword']) return 'Password must have uppercase, lowercase, number, and special character';
    return '';
  }

  passwordValidator(control: any) {
    const password = control.value;
    if (!password) return null;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password) ? null : { invalidPassword: true };
  }

  passwordMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }
}
