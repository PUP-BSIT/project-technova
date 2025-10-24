import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProfileService } from '../../services/profile.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent implements OnInit {
  private router = inject(Router);
  // Inject the service we need to fetch user data
  private profileService = inject(ProfileService);

  // New property to hold the dynamic user name (initial value is a placeholder)
  userName: string = 'User';
  isLoading: boolean = true;

  ngOnInit(): void {
    this.loadUserName();
  }

  private loadUserName(): void {
    this.isLoading = true;
    // reuse the existing getProfile method, which relies on our JWT.
    this.profileService.getProfile().subscribe({
      next: (data: any) => {
        this.isLoading = false;
        // the API returns firstName and lastName
        if (data.firstName && data.lastName) {
          this.userName = `${data.firstName} ${data.lastName}`;
        } else if (data.email) {
          // Fallback to email if name is missing
          this.userName = data.email;
        }
      },
      error: (err) => {
        console.error('Error loading user name for dashboard:', err);
        this.isLoading = false;
        this.userName = 'Guest';
      },
    });
  }

  goToSettings() {
    this.router.navigate(['/profile']);
  }

  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    sessionStorage.clear();

    this.router.navigate(['/login']);
  }
}