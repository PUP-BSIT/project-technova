import { Component, OnInit, inject, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProfileService } from '../../../services/profile.service';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-student-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-sidebar.html',
  styleUrls: ['./student-sidebar.scss']
})
export class StudentSidebarComponent implements OnInit {
  private router = inject(Router);
  private profileService = inject(ProfileService);
  private authService = inject(AuthService);

  @Input() currentView: string = 'dashboard';
  @Output() viewChanged = new EventEmitter<string>();

  user: any = null;
  isLoading = true;
  showLogoutModal: boolean = false;

  ngOnInit(): void {
    this.loadUserProfile();
  }

  private loadUserProfile(): void {
    this.isLoading = true;
    this.profileService.getProfile().subscribe({
      next: (data: any) => {
        this.isLoading = false;
        // For students, always show firstName + lastName
        let displayName: string;
        displayName = data.firstName && data.lastName 
          ? `${data.firstName} ${data.lastName}` 
          : data.email || 'User';
        
        this.user = {
          name: displayName,
          email: data.email || 'user@example.com',
          studentNumber: data.studentNumber
        };
      },
      error: (err) => {
        console.error('Error loading user profile for sidebar:', err);
        this.isLoading = false;
        // Set default user info if API fails
        this.user = {
          name: 'User',
          email: 'user@example.com',
          studentNumber: 'N/A'
        };
      }
    });
  }

  navigateTo(view: string): void {
    this.currentView = view;
    this.viewChanged.emit(view);
    
    // Only handle settings navigation since it goes to a different route
    if (view === 'settings') {
      this.router.navigate(['/profile']);
    }
    // All other views are handled by the parent component (student-dashboard)
  }

  logout(): void {
    // Show confirmation modal instead of immediate logout
    this.showLogoutModal = true;
  }

  confirmLogout(): void {
    // Use central auth service to logout
    this.authService.logout();
    this.user = null;
    this.showLogoutModal = false;
    this.router.navigate(['./role-selection']);
  }

  closeLogoutModal(): void {
    this.showLogoutModal = false;
  }
}

