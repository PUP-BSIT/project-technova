import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProfileService } from '../../services/profile.service';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { SidebarComponent } from '../sidebar/sidebar';

@Component({
  selector: 'app-org-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SidebarComponent],
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
    // Ensure proper display on component initialization
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
          phoneNumber: this.fb.control(res.phoneNumber || '', {
            nonNullable: true,
            validators: [Validators.required, Validators.pattern(/^[0-9]{10,15}$/)]
          }),
          email: this.fb.control(res.email || '', {
            nonNullable: true,
            validators: [Validators.required, Validators.email]
          }),
          address: this.fb.control(res.address || '', {
            nonNullable: true
          }),
          contactPerson: this.fb.control(res.contactPerson || '', {
            nonNullable: true
          })
        });
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
  }

  cancelEdit(): void {
    this.loadProfile(); // Reload profile to reset form
    this.isEditing = false;
    this.successMessage = '';
    this.errorMessage = '';
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.errorMessage = 'Please correct the errors in the form.';
      return;
    }

    this.loading = true;
    const updatedProfile = {
      ...this.profileForm.value
    };

    this.profileService.updateProfile(updatedProfile).subscribe({
      next: (res) => {
        this.user = res;
        this.successMessage = 'Profile updated successfully!';
        this.errorMessage = '';
        this.isEditing = false;
        this.loading = false;
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error updating profile:', error);
        this.errorMessage = 'Failed to update profile. Please try again later.';
        this.successMessage = '';
        this.loading = false;
      }
    });
  }

  goToChangePassword(): void {
    this.router.navigate(['/org-change-password']);
  }

  onViewChanged(view: string): void {
    // Handle view changes from sidebar
    console.log('View changed to:', view);
    
    // Ensure proper display when navigating
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 50);
    
    // Navigate based on the view
    switch (view) {
      case 'dashboard':
        this.router.navigate(['/org-dashboard']);
        break;
      case 'facilities':
      case 'requests':
        this.router.navigate(['/org-dashboard']);
        break;
      case 'settings':
        // Already on settings/profile, no need to navigate
        break;
    }
  }
}