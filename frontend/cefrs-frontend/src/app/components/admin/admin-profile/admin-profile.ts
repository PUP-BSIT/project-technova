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
    this.loadProfile();
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 100);
  }

  loadProfile(): void {
    this.profileService.getProfile().subscribe({
      next: (res) => {
        this.user = res;
        this.profileForm = this.fb.group({
          firstName: this.fb.control(res.firstName || '', {
            nonNullable: true,
            validators: [Validators.required]
          }),
          lastName: this.fb.control(res.lastName || '', {
            nonNullable: true,
            validators: [Validators.required]
          }),
          phoneNumber: this.fb.control(res.phoneNumber || '', {
            nonNullable: true,
            validators: [Validators.required, Validators.pattern(/^[0-9]{10,15}$/)]
          }),
          email: this.fb.control(res.email || '', {
            nonNullable: true,
            validators: [Validators.required, Validators.email]
          })
        });
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load profile. Please try again later.';
        this.loading = false;
      }
    });
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    this.successMessage = '';
    this.errorMessage = '';
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.errorMessage = 'Please correct the errors before saving.';
      return;
    }

    const payload = {
      firstName: this.profileForm.value.firstName,
      lastName: this.profileForm.value.lastName,
      phoneNumber: this.profileForm.value.phoneNumber,
      email: this.profileForm.value.email
    };

    this.profileService.updateProfile(payload).subscribe({
      next: () => {
        this.successMessage = 'Profile updated successfully.';
        this.isEditing = false;
      },
      error: () => {
        this.errorMessage = 'Failed to update profile. Please try again.';
      }
    });
  }

  goToChangePassword(): void {
    this.router.navigate(['/admin-dashboard/settings/change-password']);
  }
}


