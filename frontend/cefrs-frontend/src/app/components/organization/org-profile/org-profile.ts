import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProfileService } from '../../../services/profile.service';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-org-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './org-profile.html',
  styleUrls: ['./org-profile.scss']
})
export class OrgProfileComponent implements OnInit {

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
          organizationName: this.fb.control(res.organizationName || '', { 
            nonNullable: true,
            validators: [Validators.required] 
          }),
          firstName: this.fb.control(res.firstName || '', { nonNullable: true }),
          lastName: this.fb.control(res.lastName || '', { nonNullable: true }),
          name: this.fb.control(`${res.firstName || ''} ${res.lastName || ''}`.trim() || '', {
            nonNullable: true
          }),
          phoneNumber: this.fb.control(res.phoneNumber || '', {
            nonNullable: true,
            validators: [Validators.required, Validators.pattern(/^[0-9]{10,15}$/)]
          }),
          email: this.fb.control(res.email || '', {
            nonNullable: true,
            validators: [Validators.required, Validators.email]
          }),
          address: this.fb.control(res.address || '', {
            nonNullable: true,
            validators: [Validators.required]
          })
        });

        // Disable firstName and lastName (they're just for storage)
        this.profileForm.controls['firstName'].disable();
        this.profileForm.controls['lastName'].disable();

        if (!this.isEditing) {
          this.profileForm.disable();
        }
        this.loading = false;
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error loading profile:', error);
        this.errorMessage = 'Failed to load profile. Please try again later.';
        this.loading = false;
      }
    });
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    this.successMessage = '';
    this.errorMessage = '';
    if (!this.isEditing) {
      this.profileForm.disable();
    } else {
      this.profileForm.controls['phoneNumber'].enable();
      this.profileForm.controls['email'].enable();
      this.profileForm.controls['address'].enable();
    }
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.successMessage = '';
    this.errorMessage = '';

    const formValues = this.profileForm.getRawValue();

    const updateData = {
      firstName: formValues.firstName,
      lastName: formValues.lastName,
      phoneNumber: formValues.phoneNumber,
      email: formValues.email,
      address: formValues.address,
      password: ''
    };

    

    this.profileForm.disable();

    this.profileService.updateProfile(updateData).subscribe({
      next: (res) => {
        this.successMessage = res.message || 'Profile updated successfully.';
        this.isEditing = false;
        this.loadProfile();
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error updating profile:', error);
        console.error('Error details:', error.error);
        this.errorMessage = error.error?.message || 'Failed to update profile.';

        if (this.isEditing) {
          this.profileForm.controls['phoneNumber'].enable();
          this.profileForm.controls['email'].enable();
          this.profileForm.controls['address'].enable();
        }
      }
    });
  }

  goToChangePassword(): void {
    this.router.navigate(['/org-dashboard', 'settings', 'change-password']);
  }
}