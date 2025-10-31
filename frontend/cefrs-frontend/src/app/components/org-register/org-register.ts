import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-org-register',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './org-register.html',
  styleUrls: ['./org-register.scss']
})
export class OrgRegisterComponent implements OnInit {
  currentStep = 1;
  showPassword = false;
  showConfirmPassword = false;
  isLoading = false;
  errorMessage = '';

  // Reactive Form
  registerForm: FormGroup;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {
    // Initialize form with validation
    this.registerForm = this.fb.group({
      organizationName: ['', [Validators.required]],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8), this.passwordValidator]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    // Ensure role is set to ORGANIZATION
    console.log('Organization registration initialized');
  }

  // Custom validator for password strength
  passwordValidator(control: any) {
    const password = control.value;
    if (!password) {
      return null;
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    const isValid = passwordRegex.test(password);
    return isValid ? null : { invalidPassword: true };
  }

  // Custom validator to check if passwords match
  passwordMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  nextStep() {
    // Validation for step 1 - Organization & Personal Information
    if (this.currentStep === 1) {
      const orgName = this.registerForm.get('organizationName');
      const firstName = this.registerForm.get('firstName');
      const lastName = this.registerForm.get('lastName');

      orgName?.markAsTouched();
      firstName?.markAsTouched();
      lastName?.markAsTouched();

      if (orgName?.invalid || firstName?.invalid || lastName?.invalid) {
        return;
      }
    }

    // Validation for Step 2 - Contact information
    if (this.currentStep === 2) {
      const email = this.registerForm.get('email');
      const phone = this.registerForm.get('phoneNumber');

      email?.markAsTouched();
      phone?.markAsTouched();

      if (email?.invalid || phone?.invalid) {
        return;
      }
    }

    this.currentStep++;
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  submitForm() {
    // Mark all fields as touched to show validation errors
    this.registerForm.markAllAsTouched();

    // Check if passwords match
    if (this.registerForm.errors?.['passwordMismatch']) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    // Check password strength
    if (this.registerForm.get('password')?.errors?.['invalidPassword']) {
      this.errorMessage = 'Password must be at least 8 characters with uppercase, lowercase, number, and special character.';
      return;
    }

    // Check if form is valid
    if (this.registerForm.invalid) {
      this.errorMessage = 'Please fill in all required fields correctly.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const registerData = {
      organizationName: this.registerForm.value.organizationName,
      firstName: this.registerForm.value.firstName,
      lastName: this.registerForm.value.lastName,
      email: this.registerForm.value.email,
      phoneNumber: this.registerForm.value.phoneNumber,
      password: this.registerForm.value.password,
      role: 'STUDENT'
    };

    console.log('Sending organization registration data:', registerData);

    this.authService.register(registerData).subscribe({
      next: (response) => {
        console.log('Organization registration successful:', response);
        this.isLoading = false;
        this.currentStep = 4; // Move to success step
      },
      error: (error) => {
        console.error('Organization registration error:', error);
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
      }
    });
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  // Helper methods to check field validity
  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.registerForm.get(fieldName);
    if (field?.errors?.['required']) {
      return 'This field is required';
    }
    if (field?.errors?.['email']) {
      return 'Please enter a valid email address';
    }
    if (field?.errors?.['minlength']) {
      return `Minimum length is ${field.errors['minlength'].requiredLength} characters`;
    }
    if (field?.errors?.['invalidPassword']) {
      return 'Password must have uppercase, lowercase, number, and special character';
    }
    return '';
  }
}
