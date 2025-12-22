import { Component, OnInit, HostListener, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { StudentSidebarComponent } from '../student-sidebar/student-sidebar';
import { Dashboard } from './dashboard/dashboard';
import { Facilities } from './facilities/facilities';
import { Equipment } from './equipment/equipment';
import { MyRequests } from './my-requests/my-requests';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatButtonModule,
    MatIconModule,
    StudentSidebarComponent,
    Dashboard,
    Facilities,
    Equipment,
    MyRequests
  ],
  templateUrl: './student-dashboard.html',
  styleUrls: ['./student-dashboard.scss']
})
export class StudentDashboard implements OnInit, AfterViewInit {
  @ViewChild('sidenav') sidenav!: MatSidenav;

  currentView: 'dashboard' | 'facilities' | 'equipment' | 'requests' | 'transactions' | 'settings' | 'contact' = 'dashboard';
  isSidebarOpen = true;
  isMobileView = false;
  isSidebarCollapsed = false;
  private readonly DESKTOP_BREAKPOINT = 1024;

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.checkScreenSize();

    // Make sure the correct view is active when navigating directly via URL
    this.syncViewWithUrl(this.router.url);

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.syncViewWithUrl(event.urlAfterRedirects);
      }
    });
  }

  /**
   * Sets currentView based on the active URL so that settings routes
   * (like /student-dashboard/settings/change-password) show the
   * router-outlet instead of the dashboard.
   */
  private syncViewWithUrl(url: string): void {
    if (!url) {
      return;
    }

    if (url.includes('/student-dashboard/settings')) {
      this.currentView = 'settings';
    } else if (url.includes('/student-dashboard/contact')) {
      this.currentView = 'contact';
    } else if (url.includes('/student-dashboard/facilities')) {
      this.currentView = 'facilities';
    } else if (url.includes('/student-dashboard/equipment')) {
      this.currentView = 'equipment';
    } else if (url.includes('/student-dashboard/requests')) {
      this.currentView = 'requests';
    } else {
      this.currentView = 'dashboard';
    }
  }

  ngAfterViewInit(): void {
    // Ensure sidenav state is synced after view init
    if (this.sidenav) {
      this.isSidebarOpen = !this.isMobileView;
      this.sidenav.opened = !this.isMobileView;
      this.cdr.detectChanges();
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    this.checkScreenSize();
  }

  private checkScreenSize(): void {
    const wasMobileView = this.isMobileView;
    this.isMobileView = window.innerWidth < this.DESKTOP_BREAKPOINT;

    // If switching from mobile to desktop, open sidebar
    if (!this.isMobileView && wasMobileView && this.sidenav) {
      this.isSidebarOpen = true;
      this.sidenav.open();
    }

    // If switching to mobile, close sidebar
    if (this.isMobileView && !wasMobileView && this.sidenav) {
      this.isSidebarOpen = false;
      this.sidenav.close();
    }

    this.cdr.detectChanges();
  }

  toggleSidebar(): void {
    if (this.sidenav) {
      this.sidenav.toggle();
    }
  }

  setView(view: 'dashboard' | 'facilities' | 'equipment' | 'requests' | 'transactions' | 'settings' | 'contact'): void {
    this.currentView = view;

    if (view === 'settings') {
      this.router.navigate(['/student-dashboard/settings/profile']);
    } else if (view === 'contact') {
      this.router.navigate(['/student-dashboard', 'contact']);
    } else if (view === 'dashboard') {
      this.router.navigate(['/student-dashboard']);
    } else if (view === 'facilities') {
      this.router.navigate(['/student-dashboard/facilities']);
    } else if (view === 'equipment') {
      this.router.navigate(['/student-dashboard/equipment']);
    } else if (view === 'requests') {
      this.router.navigate(['/student-dashboard/requests']);
    }
  }

  onSidebarViewChange(view: string): void {
    this.setView(view as 'dashboard' | 'facilities' | 'equipment' | 'requests' | 'transactions' | 'settings' | 'contact');
    
    // Close sidebar on mobile after navigation
    if (this.isMobileView && this.sidenav) {
      this.sidenav.close();
    }
  }

  onSidebarCollapsedChange(collapsed: boolean): void {
    this.isSidebarCollapsed = collapsed;
    // Force Angular Material to recalculate layout
    if (this.sidenav && !this.isMobileView) {
      // Trigger change detection to update layout
      setTimeout(() => {
        this.cdr.detectChanges();
      }, 0);
    }
  }
}