import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProfileService } from '../../../services/profile.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-profile.html',
  styleUrls: ['./admin-profile.scss']
})
export class AdminProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private profileService = inject(ProfileService);
  private router = inject(Router);

  profileForm!: FormGroup;
  user: any = null;
  isEditing = false;
  loading = true;
  successMessage = '';
  errorMessage = '';

  ngOnInit(): void {
    this.initializeForm();
    this.loadProfile();
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 100);
  }

  initializeForm(): void {
    this.profileForm = this.fb.group({
      firstName: [{ value: '', disabled: true }, Validators.required],
      lastName: [{ value: '', disabled: true }, Validators.required],
      phoneNumber: [{ value: '', disabled: true }, [Validators.required, Validators.pattern(/^[0-9]{10,15}$/)]],
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      address: [{ value: '', disabled: true }, Validators.required]
    });
  }

  loadProfile(): void {
    this.profileService.getProfile().subscribe({
      next: (res) => {
        this.user = res;
        this.profileForm.patchValue({
          firstName: res.firstName || '',
          lastName: res.lastName || '',
          phoneNumber: res.phoneNumber || '',
          email: res.email || '',
          address: res.address || ''
        });
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading profile:', err);
        this.errorMessage = 'Failed to load profile. Please try again later.';
        this.loading = false;
      }
    });
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    this.successMessage = '';
    this.errorMessage = '';

    if (this.isEditing) {
      this.profileForm.get('firstName')?.enable();
      this.profileForm.get('lastName')?.enable();
      this.profileForm.get('phoneNumber')?.enable();
      this.profileForm.get('address')?.enable();
    } else {
      // Disable all fields and reset to original values
      this.profileForm.disable();
      this.loadProfile();
    }
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.errorMessage = 'Please correct the errors before saving.';
      Object.keys(this.profileForm.controls).forEach(key => {
        this.profileForm.get(key)?.markAsTouched();
      });
      return;
    }

    const payload = {
      firstName: this.profileForm.get('firstName')?.value,
      lastName: this.profileForm.get('lastName')?.value,
      phoneNumber: this.profileForm.get('phoneNumber')?.value,
      email: this.profileForm.get('email')?.value,
      address: this.profileForm.get('address')?.value
    };

    console.log('Sending update payload:', payload);

    this.profileService.updateProfile(payload).subscribe({
      next: (response) => {
        console.log('Update successful:', response);
        this.successMessage = 'Profile updated successfully.';
        this.errorMessage = '';
        this.isEditing = false;
        this.profileForm.disable();
        this.loadProfile();
      },
      error: (error) => {
        console.error('Update error:', error);
        this.errorMessage = error.error?.message || 'Failed to update profile. Please try again.';
        this.successMessage = '';
      }
    });
  }

  goToChangePassword(): void {
    this.router.navigate(['/admin-dashboard/settings/change-password']);
  }
}