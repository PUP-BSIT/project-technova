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
        address: ['', [Validators.required]],
        phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{11}$/)]],
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
      const address = this.registerForm.get('address');
      email?.markAsTouched();
      phone?.markAsTouched();
      address?.markAsTouched();
      // Check if phone is taken
      if (email?.invalid || phone?.invalid || address?.invalid || this.phoneNumberTaken) {
        if (this.phoneNumberTaken) {
          this.errorMessage = 'This phone number is already registered';
        }
        return;
      }
    }
    this.errorMessage = ''; // Clear error message when moving to next step
    this.currentStep++;
  }

  previousStep() {
    if (this.currentStep > 1) this.currentStep--;
  }

  submitForm() {
    this.registerForm.markAllAsTouched();

    // Check if phone number is taken
    if (this.phoneNumberTaken) {
      this.errorMessage = 'This phone number is already registered. Please use a different number.';
      return;
    }

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
      address: this.registerForm.value.address,
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
    if (field?.errors?.['pattern']) {
      if (fieldName === 'phoneNumber') {
        return 'Phone number must be exactly 11 digits';
      }
      return 'Invalid format';
    }
    if (field?.errors?.['minlength']) return `Minimum length is ${field.errors['minlength'].requiredLength} characters`;
    if (field?.errors?.['invalidPassword']) return 'Password must have uppercase, lowercase, number, and special character';
    return '';
  }

  onPhoneKeyPress(event: KeyboardEvent): boolean {
    // Allow only numeric keys (0-9), backspace, delete, tab, escape, enter, and arrow keys
    const charCode = event.which ? event.which : event.keyCode;
    const phoneControl = this.registerForm.get('phoneNumber');
    const currentValue = phoneControl?.value || '';

    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      event.preventDefault();
      return false;
    }
    // Check if we've reached 11 digits
    if (currentValue.length >= 11 && charCode >= 48 && charCode <= 57) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  onPhoneInput(event: any): void {
    // Remove all non-numeric characters and limit to 11 digits
    const value = event.target.value.replace(/[^0-9]/g, '').slice(0, 11);
    // Update form control value
    this.registerForm.patchValue({ phoneNumber: value }, { emitEvent: false });

    // Check phone availability
    this.checkPhoneAvailability(value);
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

  phoneNumberTaken = false;
  checkingPhoneNumber = false;
  phoneNumberCheckTimeout: any;

  checkPhoneAvailability(phoneNumber: string): void {
    // Clear previous timeout
    if (this.phoneNumberCheckTimeout) {
      clearTimeout(this.phoneNumberCheckTimeout);
    }

    // Reset validation state
    this.phoneNumberTaken = false;

    // Only check if phone number is valid (11 digits)
    if (phoneNumber && phoneNumber.length === 11) {
      this.checkingPhoneNumber = true;

      // Debounce: wait 500ms after user stops typing
      this.phoneNumberCheckTimeout = setTimeout(() => {
        this.authService.checkPhoneNumberAvailability(phoneNumber).subscribe({
          next: (isAvailable) => {
            this.phoneNumberTaken = !isAvailable;
            this.checkingPhoneNumber = false;
          },
          error: (err) => {
            console.error('Error checking phone number:', err);
            this.checkingPhoneNumber = false;
          }
        });
      }, 500);
    } else {
      this.checkingPhoneNumber = false;
    }
  }
}