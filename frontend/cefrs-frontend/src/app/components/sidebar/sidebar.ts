import { Component, OnInit, inject, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProfileService } from '../../services/profile.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.scss']
})
export class SidebarComponent implements OnInit {
  private router = inject(Router);
  private profileService = inject(ProfileService);

  @Input() currentView: string = 'dashboard';
  @Output() viewChanged = new EventEmitter<string>();

  user: any = null;
  isLoading = true;

  ngOnInit(): void {
    this.loadUserProfile();
  }

  private loadUserProfile(): void {
    this.isLoading = true;
    this.profileService.getProfile().subscribe({
      next: (data: any) => {
        this.isLoading = false;
        this.user = {
          name: data.firstName && data.lastName ? `${data.firstName} ${data.lastName}` : data.email || 'User',
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
    // Clear all authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    sessionStorage.clear();
    
    // Reset user data
    this.user = null;
    
    // Navigate to login
    this.router.navigate(['/login']);
  }
}
