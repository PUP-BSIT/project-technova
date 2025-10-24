import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProfileService } from '../../services/profile.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss'],
  imports: [CommonModule, ReactiveFormsModule],
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private profileService = inject(ProfileService);
  private router = inject(Router);

  profileForm!: FormGroup;
  alertMessage = '';
  profileImageUrl: string | null = null;
  isLoading = false;

  ngOnInit(): void {
    this.initializeForm();
    this.loadProfile();
  }

  private initializeForm(): void {
    this.profileForm = this.fb.group({
      studentNumber: [{ value: '', disabled: true }],
      firstName: [{ value: '', disabled: true }],
      lastName: [{ value: '', disabled: true }],
      gender: [{ value: '', disabled: true }],
      dateOfBirth: [{ value: '', disabled: true }],
      mobileNumber: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
      email: ['', [Validators.required, Validators.email]],
      residentialAddress: ['', Validators.required],
      permanentAddress: ['', Validators.required],
      profileImage: [null],
    });
  }

  /** Load user data from backend */
  private loadProfile(): void {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      this.alertMessage = 'No user found. Please log in again.';
      return;
    }

    this.isLoading = true;

    this.profileService.getProfile().subscribe({
      next: (data: any) => {
        this.isLoading = false;
        this.profileForm.patchValue({
          studentNumber: data.id,
          firstName: data.firstName,
          lastName: data.lastName,
          gender: 'Male',
          dateOfBirth: '2000-08-18',
          mobileNumber: data.phoneNumber,
          email: data.email,
          residentialAddress: data.organizationName || '',
          permanentAddress: data.organizationName || '',
        });

        if (data.profileImageUrl) {
          this.profileImageUrl = data.profileImageUrl;
        }
      },
      error: (err) => {
        console.error('Error loading profile:', err);
        this.alertMessage = 'Failed to load profile. Please check if your Spring Boot backend is running.';
        this.isLoading = false;
      },
    });
  }

  /** Save updates */
  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.alertMessage = 'Please fix form errors before saving.';
      this.profileForm.markAllAsTouched();
      return;
    }

    const formData = this.profileForm.getRawValue();

    // Data Transfer Object (DTO) for the update
    const updateData = {
      firstName: formData.firstName || '',
      lastName: formData.lastName || '',
      email: formData.email,
      phoneNumber: formData.mobileNumber,
      password: 'placeholder123', // backend needs a password field in DTO
      role: 'STUDENT',
      organizationName: formData.residentialAddress,
    };

    this.isLoading = true;
    this.profileService.updateProfile(updateData).subscribe({
      next: () => {
        this.isLoading = false;
        this.alertMessage = 'Profile updated successfully!';
      },
      error: (err) => {
        console.error('Profile update failed:', err);
        this.alertMessage = 'Failed to update profile.';
        this.isLoading = false;
      },
    });
  }

  /** Upload photo preview */
  uploadPhoto(): void {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = (event: Event) => {
      const input = event.target as HTMLInputElement;
      const file = input.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        this.profileImageUrl = reader.result as string;
        this.profileForm.patchValue({ profileImage: file });
      };
      reader.readAsDataURL(file);
    };
    fileInput.click();
  }

  /** Navigation */
  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}
