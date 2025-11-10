import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ReservationService, ReservationRequest } from '../../services/reservation.service';
import { FacilityService } from '../../services/facility.service';

interface Facility {
  id: number;
  name: string;
  type: string;
  building?: string;
  floor?: string;
  capacity: number;
  description?: string;
  status: string;
}

@Component({
  selector: 'app-reservation-request',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reservation-request.html',
  styleUrls: ['./reservation-request.scss']
})
export class ReservationRequestComponent implements OnInit {
  facilities: Facility[] = [];
  selectedFacilityId: number | null = null;
  reservationDate: string = '';
  startTime: string = '';
  endTime: string = '';
  purpose: string = '';
  
  loading = false;
  error: string | null = null;
  success: string | null = null;

  constructor(
    private reservationService: ReservationService,
    private facilityService: FacilityService,
    public router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Check if facilityId is passed as query parameter
    this.route.queryParams.subscribe(params => {
      if (params['facilityId']) {
        const facilityId = parseInt(params['facilityId'], 10);
        if (!isNaN(facilityId)) {
          this.selectedFacilityId = facilityId;
        }
      }
    });
    
    this.loadFacilities();
  }

  loadFacilities(): void {
    this.facilityService.getAvailableFacilities().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.facilities = response.data;
        }
      },
      error: (err) => {
        console.error('Error loading facilities:', err);
        this.error = 'Failed to load facilities';
      }
    });
  }

  onSubmit(): void {
    if (!this.validateForm()) {
      return;
    }

    this.loading = true;
    this.error = null;
    this.success = null;

    const request: ReservationRequest = {
      facilityId: this.selectedFacilityId!,
      startTime: `${this.reservationDate} ${this.startTime}:00`,
      endTime: `${this.reservationDate} ${this.endTime}:00`,
      purpose: this.purpose
    };

    this.reservationService.createReservation(request).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.success = 'Reservation request submitted successfully!';
          setTimeout(() => {
            this.router.navigate(['/my-reservations']);
          }, 2000);
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Failed to submit reservation request';
        console.error('Error creating reservation:', err);
      }
    });
  }

  validateForm(): boolean {
    if (!this.selectedFacilityId) {
      this.error = 'Please select a facility';
      return false;
    }
    if (!this.reservationDate) {
      this.error = 'Please select a date';
      return false;
    }
    if (!this.startTime) {
      this.error = 'Please select a start time';
      return false;
    }
    if (!this.endTime) {
      this.error = 'Please select an end time';
      return false;
    }
    if (this.startTime >= this.endTime) {
      this.error = 'End time must be after start time';
      return false;
    }
    if (!this.purpose.trim()) {
      this.error = 'Please provide a purpose';
      return false;
    }
    return true;
  }

  getMinDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  goBack(): void {
    // Navigate back to student dashboard or previous page
    const userRole = localStorage.getItem('role');
    if (userRole === 'STUDENT') {
      this.router.navigate(['/student-dashboard']);
    } else if (userRole === 'ORGANIZATION') {
      this.router.navigate(['/org-dashboard']);
    } else {
      this.router.navigate(['/']);
    }
  }
}

