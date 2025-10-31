import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';
import { SidebarComponent } from '../sidebar/sidebar';

// --- INTERFACES ---
interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: string;
  organizationName: string;
  isActive: boolean;
}

interface Request {
  id: string;
  title: string;
  type: 'Equipment' | 'Facility';
  status: 'Pending' | 'Approved' | 'Rejected' | 'Returned';
  quantity?: number;
  requestDate: string;
  returnDate?: string;
  dayOfEvent?: string;
  adminNotes: string;
}

interface Facility {
  id: string;
  name: string;
  location: string;
  description: string;
  capacity: number;
  image: string;
  status: 'Available' | 'Reserved';
}

@Component({
  selector: 'app-org-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SidebarComponent],
  templateUrl: './org-dashboard.html',
  styleUrls: ['./org-dashboard.scss']
})
export class OrgDashboardComponent implements OnInit {
  user: User | null = null;
  requests: Request[] = [];
  facilities: Facility[] = [];
  activeTab: 'requests' | 'facilities' = 'requests';
  isLoading = true;
  errorMessage = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    // Load user data
    this.loadUserData();
    
    // Load organization requests
    this.loadRequests();
    
    // Load available facilities
    this.loadFacilities();
  }

  loadUserData(): void {
    this.authService.getUserProfile().subscribe({
      next: (userData) => {
        this.user = userData;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading user profile:', error);
        this.errorMessage = 'Unable to load user data';
        this.isLoading = false;
      }
    });
  }

  loadRequests(): void {
    // Mock data - would be replaced with actual API call
    this.requests = [
      {
        id: '1',
        title: 'Conference Room A',
        type: 'Facility',
        status: 'Approved',
        requestDate: '2023-10-15',
        dayOfEvent: '2023-10-20',
        adminNotes: 'Approved for use from 9 AM to 5 PM'
      },
      {
        id: '2',
        title: 'Projector',
        type: 'Equipment',
        status: 'Pending',
        quantity: 2,
        requestDate: '2023-10-16',
        returnDate: '2023-10-21',
        adminNotes: ''
      }
    ];
  }

  loadFacilities(): void {
    // Mock data - would be replaced with actual API call
    this.facilities = [
      {
        id: '1',
        name: 'Conference Room A',
        location: 'Building 1, Floor 2',
        description: 'Large conference room with projector and whiteboard',
        capacity: 30,
        image: 'assets/images/conference-room.jpg',
        status: 'Available'
      },
      {
        id: '2',
        name: 'Auditorium',
        location: 'Main Building, Ground Floor',
        description: 'Large auditorium with stage and sound system',
        capacity: 200,
        image: 'assets/images/auditorium.jpg',
        status: 'Available'
      }
    ];
  }

  setActiveTab(tab: 'requests' | 'facilities'): void {
    this.activeTab = tab;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/role-selection']);
  }

  goToProfile(): void {
    this.router.navigate(['/org-profile']);
  }

  createNewRequest(): void {
    // Navigate to request creation page
    this.router.navigate(['/create-request']);
  }

  viewRequestDetails(requestId: string): void {
    // Navigate to request details page
    this.router.navigate(['/request-details', requestId]);
  }

  reserveFacility(facilityId: string): void {
    // Navigate to facility reservation page
    this.router.navigate(['/reserve-facility', facilityId]);
  }
}