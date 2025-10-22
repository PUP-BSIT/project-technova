import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './register.html',
  styleUrls: ['./register.scss']
})
export class RegisterComponent implements OnInit {
  currentStep = 1;
  showPassword = false;
  showConfirmPassword = false;
  passwordMismatch = false;
  hasPasswordError = false;
  isLoading = false;
  errorMessage = '';

  // Validation flags
  showFirstNameError = false;
  showLastNameError = false;
  showRoleError = false;
  showEmailError = false;
  showPhoneError = false;

  formData = {
    firstName: '',
    middleName: '',
    lastName: '',
    studentId: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: '',
    role: ''
  };

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    // Get the role from the URL query parameters (e.g., ?role=STUDENT)
    this.route.queryParams.subscribe(params => {
      const roleFromUrl = params['role'];

      if (roleFromUrl) {
        // Assign the role to the formData object which is used in submitForm()
        this.formData.role = roleFromUrl;
        console.log('Successfully set role from URL:', this.formData.role);
      } else {
        // If no role is in the URL, redirect back to the selection page
        console.error('Error: Role parameter is missing from the URL. Redirecting.');
        this.router.navigate(['/select-role']); // selection path
      }
    });
  }

  nextStep() {
    // Validation for step 1 - personal Information
    if (this.currentStep === 1) {
      this.showFirstNameError = !this.formData.firstName.trim();
      this.showLastNameError = !this.formData.lastName.trim();

      if (this.showFirstNameError || this.showLastNameError) {
        return;
      }
    }

    // Validation for Step 2 - contact information
    if (this.currentStep === 2) {
      this.showEmailError = !this.formData.email.trim() || !this.isValidEmail(this.formData.email);
      this.showPhoneError = !this.formData.phone.trim();

      if (this.showEmailError || this.showPhoneError) {
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

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  submitForm() {
    // check if passwords match
    if (this.formData.password !== this.formData.confirmPassword) {
      this.passwordMismatch = true;
      this.hasPasswordError = true;
      return;
    }

    // validate password strength
    if (!this.isValidPassword(this.formData.password)) {
      this.errorMessage = 'Password must be at least 8 characters with uppercase, lowercase, number, and special character.';
      this.hasPasswordError = true;
      return;
    }

    // FINAL CHECK: If role is somehow missing just before submission, stop and error.
    if (!this.formData.role) {
      this.errorMessage = 'Role type is missing. Please restart the process from role selection.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.passwordMismatch = false;
    this.hasPasswordError = false;

    const registerData = {
      firstName: this.formData.firstName,
      lastName: this.formData.lastName,
      email: this.formData.email,
      phoneNumber: this.formData.phone,
      password: this.formData.password,
      role: this.formData.role,
      organizationName: this.formData.address || 'Computer Society' // Default value if address is empty
    };

    console.log('Sending registration data:', registerData);

    this.authService.register(registerData).subscribe({
      next: (response) => {
        console.log('Registration successful:', response);
        this.isLoading = false;
        this.currentStep = 4; // Move to success step
      },
      error: (error) => {
        console.error('Registration error:', error);
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
      }
    });
  }

  isValidPassword(password: string): boolean {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }

  goToDashboard() {
    this.router.navigate(['/student-dashboard/student-dashboard']);
  }
}