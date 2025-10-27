import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProfileService } from '../../services/profile.service';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { SidebarComponent } from '../sidebar/sidebar';

@Component({
  selector: 'app-student-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SidebarComponent],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss']
})
export class StudentProfileComponent implements OnInit {
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
          studentNumber: this.fb.control(res.studentNumber || '', { nonNullable: true }),
          name: this.fb.control(`${res.firstName} ${res.lastName}` || '', { nonNullable: true }),
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
    if (!this.isEditing) this.profileForm.disable();
    else this.profileForm.enable();
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.successMessage = '';
    this.errorMessage = '';

    const updateData = {
      phoneNumber: this.profileForm.value.phoneNumber,
      email: this.profileForm.value.email,
      address: this.profileForm.value.address
    };

    this.profileService.updateProfile(updateData).subscribe({
      next: (res) => {
        this.successMessage = res.message || 'Profile updated successfully.';
        this.isEditing = false;
        this.loadProfile();
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error updating profile:', err);
        this.errorMessage = err.error?.message || 'Failed to update profile.';
      }
    });
  }

 goToChangePassword(): void {
  this.router.navigate(['/student-change-password']);
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
       this.router.navigate(['/student-dashboard']);
       break;
     case 'facilities':
     case 'equipment':
     case 'requests':
       this.router.navigate(['/student-dashboard']);
       break;
     case 'settings':
       // Already on settings/profile, no need to navigate
       break;
   }
 }
}
