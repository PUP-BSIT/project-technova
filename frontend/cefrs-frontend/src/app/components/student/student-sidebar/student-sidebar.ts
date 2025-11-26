import { Component, OnInit, OnDestroy, AfterViewInit, inject, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatSidenav } from '@angular/material/sidenav';
import { ProfileService } from '../../../services/profile.service';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-student-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-sidebar.html',
  styleUrls: ['./student-sidebar.scss']
})
export class StudentSidebarComponent implements OnInit, OnDestroy, AfterViewInit {
  private router = inject(Router);
  private profileService = inject(ProfileService);
  private authService = inject(AuthService);

  @Input() currentView: string = 'dashboard';
  @Input() sidenav!: MatSidenav;
  @Output() viewChanged = new EventEmitter<string>();

  isSidebarOpen = true;
  isMobileView = false;
  private readonly DESKTOP_BREAKPOINT = 1024;
  private initialized = false;

  user: any = null;
  isLoading = true;
  showLogoutModal: boolean = false;

  ngOnInit(): void {
    this.loadUserProfile();
    // Initialize viewport evaluation early to avoid ExpressionChangedAfterItHasBeenCheckedError
    this.evaluateViewport();
  }

  ngAfterViewInit(): void {
    // Re-evaluate viewport after view init to ensure sidenav is available
    if (this.sidenav) {
      this.evaluateViewport();
      this.sidenav.openedChange.subscribe(opened => {
        this.isSidebarOpen = opened;
      });
    }
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.evaluateViewport();
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
    
    // Close sidebar on mobile after navigation
    if (this.isMobileView && this.sidenav) {
      this.sidenav.close();
    }
    
    // Only handle settings navigation since it goes to a different route
    if (view === 'settings') {
      this.router.navigate(['/profile']);
    }
    // All other views are handled by the parent component (student-dashboard)
  }

  toggleSidebar(): void {
    if (this.sidenav) {
      this.sidenav.toggle();
    }
  }

  private evaluateViewport(): void {
    if (typeof window === 'undefined') {
      return;
    }

    const previousMobileState = this.isMobileView;
    const nextMobileState = window.innerWidth < this.DESKTOP_BREAKPOINT;
    this.isMobileView = nextMobileState;

    if (!nextMobileState && previousMobileState && this.sidenav) {
      this.sidenav.open();
    }

    if (!this.initialized) {
      this.isSidebarOpen = !this.isMobileView;
      if (this.sidenav) {
        this.sidenav.opened = !this.isMobileView;
      }
      this.initialized = true;
    }
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

