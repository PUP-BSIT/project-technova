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
  @Output() collapsedChanged = new EventEmitter<boolean>();

  isSidebarOpen = true;
  isMobileView = false;
  isCollapsed = false; // Desktop collapse state
  private readonly DESKTOP_BREAKPOINT = 1024;
  private initialized = false;

  user: any = null;
  isLoading = true;
  showLogoutModal: boolean = false;

  ngOnInit(): void {
    this.loadUserProfile();
    this.evaluateViewport();
  }

  ngAfterViewInit(): void {
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

    if (view === 'settings') {
      this.router.navigate(['/student-dashboard', 'settings', 'profile']);
    } else if (view === 'contact') {
      // Navigate to contact us page
      this.router.navigate(['/student-dashboard', 'contact']);
    }
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
    this.showLogoutModal = true;
  }

  confirmLogout(): void {
    this.authService.logout();
    this.user = null;
    this.showLogoutModal = false;
    this.router.navigate(['/']);
  }

  closeLogoutModal(): void {
    this.showLogoutModal = false;
  }

  toggleCollapse(): void {
    // Only allow collapse on desktop
    if (!this.isMobileView) {
      // Toggle between expanded and collapsed (icons only) states
      // Sidebar stays open, just changes width
      this.isCollapsed = !this.isCollapsed;
      this.collapsedChanged.emit(this.isCollapsed);
    }
  }

  get isDesktop(): boolean {
    return !this.isMobileView;
  }
}