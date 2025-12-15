import { Component, ViewChild, AfterViewInit, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../services/auth';
import { OrgSidebarComponent } from '../org-sidebar/org-sidebar';
import { Dashboard } from './dashboard/dashboard'; 
import { OrgFacilitiesComponent } from './facilities/facilities';
import { OrgEquipmentComponent } from './equipment/equipment';
import { OrgMyRequestComponent } from './my-request/my-request';

@Component({
  selector: 'app-org-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatSidenavModule,
    MatButtonModule,
    MatIconModule,
    Dashboard,
    OrgSidebarComponent,
    OrgFacilitiesComponent,
    OrgEquipmentComponent,
    OrgMyRequestComponent
  ],
  templateUrl: './org-dashboard.html',
  styleUrls: ['./org-dashboard.scss']
})
export class OrgDashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('sidenav') sidenav!: MatSidenav;
  @ViewChild(OrgSidebarComponent) sidebarComponent!: OrgSidebarComponent;
  
  currentView: 'dashboard' | 'facilities' | 'equipment' | 'requests' | 'transactions' | 'settings' = 'dashboard';
  isSidebarOpen = true;
  isMobileView = false;
  isSidebarCollapsed = false;
  private readonly DESKTOP_BREAKPOINT = 1024;

  constructor(private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.checkScreenSize();

    // Ensure correct view when navigating directly to a child settings route
    this.syncViewWithUrl(this.router.url);

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.syncViewWithUrl(event.urlAfterRedirects);
      }
    });
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

  /**
   * Sets the currentView based on the active URL so that settings routes
   * (like /org-dashboard/settings/change-password) show the router-outlet
   * instead of the dashboard.
   */
  private syncViewWithUrl(url: string): void {
    if (!url) {
      return;
    }

    if (url.includes('/org-dashboard/settings')) {
      this.currentView = 'settings';
    } else if (url.includes('/org-dashboard/facilities')) {
      this.currentView = 'facilities';
    } else if (url.includes('/org-dashboard/equipment')) {
      this.currentView = 'equipment';
    } else if (url.includes('/org-dashboard/requests')) {
      this.currentView = 'requests';
    } else {
      this.currentView = 'dashboard';
    }
  }

  setView(view: 'dashboard' | 'facilities' | 'equipment' | 'requests' | 'transactions' | 'settings'): void {
    this.currentView = view;

    if (view === 'settings') {
      this.router.navigate(['/org-dashboard', 'settings', 'profile']);
    } else if (view === 'dashboard') {
      this.router.navigate(['/org-dashboard']);
    }
  }

  onSidebarViewChange(view: string): void {
    this.setView(view as 'dashboard' | 'facilities' | 'equipment' | 'requests' | 'transactions' | 'settings');
    
    // Close sidebar on mobile after navigation
    if (this.isMobileView && this.sidenav) {
      this.sidenav.close();
    }
  }

  onSidebarCollapsedChange(collapsed: boolean): void {
    this.isSidebarCollapsed = collapsed;
    // Force Angular Material to recalc layout when width changes on desktop
    if (this.sidenav && !this.isMobileView) {
      setTimeout(() => {
        this.cdr.detectChanges();
      }, 0);
    }
  }
}