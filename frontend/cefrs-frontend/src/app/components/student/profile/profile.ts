import { Component, OnInit, inject, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProfileService } from '../../../services/profile.service';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-student-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatSidenavModule, MatButtonModule, MatIconModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss']
})
export class StudentProfileComponent implements OnInit {
  @ViewChild('sidenav') sidenav!: MatSidenav;

  private fb = inject(FormBuilder);
  private profileService = inject(ProfileService);
  private router = inject(Router);

  profileForm!: FormGroup;
  user: any = null;
  isEditing = false;
  loading = true;
  successMessage = '';
  errorMessage = '';
  isMobileView = false;
  private readonly DESKTOP_BREAKPOINT = 1024;
  ngOnInit(): void {
    this.checkScreenSize();
    this.loadProfile();
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 100);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    this.checkScreenSize();
  }

  private checkScreenSize(): void {
    this.isMobileView = window.innerWidth < this.DESKTOP_BREAKPOINT;
  }

  loadProfile(): void {
    this.profileService.getProfile().subscribe({
      next: (res) => {
        this.user = res;
        this.profileForm = this.fb.group({
          studentId: this.fb.control(res.studentId || '', {
            nonNullable: true,
            validators: [Validators.required]
          }),
          firstName: this.fb.control(res.firstName || '', { nonNullable: true }),
          lastName: this.fb.control(res.lastName || '', { nonNullable: true }),
          name: this.fb.control(`${res.firstName} ${res.lastName}` || '', {
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
      error: (err: HttpErrorResponse) => {
        console.error('Profile load failed:', err);
        this.loading = false;
        this.errorMessage = 'Unable to load profile data.';
      }
    });
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
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
      firstName: formValues.firstName,      // Add this
      lastName: formValues.lastName,        // Add this
      phoneNumber: formValues.phoneNumber,
      email: formValues.email,
      address: formValues.address,
      password: ''  // You might need to handle this differently
    };

    console.log('Sending update data:', updateData);

    this.profileForm.disable();

    this.profileService.updateProfile(updateData).subscribe({
      next: (res) => {
        this.successMessage = res.message || 'Profile updated successfully.';
        this.isEditing = false;
        this.loadProfile();
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error updating profile:', err);
        console.error('Error details:', err.error);
        this.errorMessage = err.error?.message || 'Failed to update profile.';

        if (this.isEditing) {
          this.profileForm.controls['phoneNumber'].enable();
          this.profileForm.controls['email'].enable();
          this.profileForm.controls['address'].enable();
        }
      }
    });
  }

  goToChangePassword(): void {
    // Navigate to nested change-password in dashboard layout
    this.router.navigate(['/student-dashboard', 'settings', 'change-password']);
  }
}

