import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FacilityService } from '../../../../services/facility.service';
import { ReservationService, ReservationRequest, SuggestedFacilities } from '../../../../services/reservation.service';

interface Facility {
  id: number;
  name: string;
  type: string;
  building: string;
  floor: string;
  capacity: number;
  description: string;
  imageUrl: string;
  status: string;
}

@Component({
  selector: 'app-facilities',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './facilities.html',
  styleUrls: ['./facilities.scss']
})
export class Facilities implements OnInit {
  private facilityService = inject(FacilityService);
  private reservationService = inject(ReservationService);

  facilities: Facility[] = [];
  isLoadingFacilities = false;
  searchQuery = '';

  // Modal state
  showReservationModal = false;
  showSuccessModal = false;
  selectedFacility: Facility | null = null;
  reservationForm = {
    facilityId: null as number | null,
    reservationDate: '',
    startTime: '',
    endTime: '',
    purpose: ''
  };
  reservationLoading = false;
  reservationError: string | null = null;

  // Suggestions state
  showSuggestionsModal = false;
  suggestedFacilities: SuggestedFacilities | null = null;
  suggestionsLoading = false;

  ngOnInit(): void {
    this.fetchFacilities();
  }

  fetchFacilities(): void {
    this.isLoadingFacilities = true;
    this.facilityService.getAvailableFacilities().subscribe({
      next: (facilities) => {
        this.facilities = facilities || [];
        this.isLoadingFacilities = false;
      },
      error: (err: any) => {
        console.error('Error fetching facilities:', err);
        this.isLoadingFacilities = false;
        this.facilities = [];
      }
    });
  }

  get filteredFacilities(): Facility[] {
    if (!this.facilities || !Array.isArray(this.facilities)) {
      return [];
    }

    if (!this.searchQuery.trim()) {
      return this.facilities;
    }

    const query = this.searchQuery.toLowerCase();
    return this.facilities.filter(facility =>
      facility.name?.toLowerCase().includes(query) ||
      facility.building?.toLowerCase().includes(query) ||
      facility.floor?.toLowerCase().includes(query) ||
      facility.description?.toLowerCase().includes(query) ||
      facility.type?.toLowerCase().includes(query)
    );
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      Available: 'status-available',
      AVAILABLE: 'status-available',
      Reserved: 'status-reserved'
    };
    return map[status] || '';
  }

  requestFacility(facilityId: number): void {
    const facility = this.facilities.find(f => f.id === facilityId);
    if (facility && facility.status === 'AVAILABLE') {
      this.selectedFacility = facility;
      this.reservationForm.facilityId = facilityId;
      this.reservationForm.reservationDate = '';
      this.reservationForm.startTime = '';
      this.reservationForm.endTime = '';
      this.reservationForm.purpose = '';
      this.reservationError = null;
      this.showReservationModal = true;
    }
  }

  closeReservationModal(): void {
    this.showReservationModal = false;
    this.selectedFacility = null;
    this.reservationForm = {
      facilityId: null,
      reservationDate: '',
      startTime: '',
      endTime: '',
      purpose: ''
    };
    this.reservationError = null;
  }

  submitReservation(): void {
    if (!this.validateReservationForm()) {
      return;
    }

    this.reservationLoading = true;
    this.reservationError = null;

    const request: ReservationRequest = {
      facilityId: this.reservationForm.facilityId!,
      startTime: `${this.reservationForm.reservationDate} ${this.reservationForm.startTime}:00`,
      endTime: `${this.reservationForm.reservationDate} ${this.reservationForm.endTime}:00`,
      purpose: this.reservationForm.purpose
    };

    this.reservationService.createReservation(request).subscribe({
      next: (response) => {
        this.reservationLoading = false;
        if (response.success) {
          this.closeReservationModal();
          this.showSuccessModal = true;
          this.fetchFacilities();
        }
      },
      error: (err) => {
        this.reservationLoading = false;
        // Extract error message from different possible locations
        const errorMessage = err.error?.error || err.error?.message || err.message || 'Failed to create reservation';
        this.reservationError = errorMessage;
        
        // Check if it's a time slot conflict
        if (errorMessage.toLowerCase().includes('already reserved') || errorMessage.toLowerCase().includes('conflict')) {
          this.loadSuggestions();
        }
        
        console.error('Error creating reservation:', errorMessage);
      }
    });
  }

  loadSuggestions(): void {
    if (!this.reservationForm.facilityId || !this.reservationForm.reservationDate || 
        !this.reservationForm.startTime || !this.reservationForm.endTime) {
      return;
    }

    this.suggestionsLoading = true;
    
    this.reservationService.getSuggestedFacilities(
      this.reservationForm.facilityId,
      this.reservationForm.reservationDate,
      this.reservationForm.startTime,
      this.reservationForm.endTime
    ).subscribe({
      next: (response) => {
        this.suggestionsLoading = false;
        if (response.success) {
          this.suggestedFacilities = response.data;
          this.showSuggestionsModal = true;
        }
      },
      error: (err) => {
        this.suggestionsLoading = false;
        console.error('Error loading suggestions:', err);
      }
    });
  }

  selectSuggestedFacility(facilityId: number): void {
    const facility = this.facilities.find(f => f.id === facilityId);
    if (facility) {
      this.closeSuggestionsModal();
      this.selectedFacility = facility;
      this.reservationForm.facilityId = facilityId;
      this.reservationError = null;
      this.showReservationModal = true;
    }
  }

  closeSuggestionsModal(): void {
    this.showSuggestionsModal = false;
    this.suggestedFacilities = null;
  }

  validateReservationForm(): boolean {
    if (!this.reservationForm.facilityId) {
      this.reservationError = 'Please select a facility';
      return false;
    }
    if (!this.reservationForm.reservationDate) {
      this.reservationError = 'Please select a date';
      return false;
    }
    if (!this.reservationForm.startTime) {
      this.reservationError = 'Please select a start time';
      return false;
    }
    if (!this.reservationForm.endTime) {
      this.reservationError = 'Please select an end time';
      return false;
    }
    if (this.reservationForm.startTime >= this.reservationForm.endTime) {
      this.reservationError = 'End time must be after start time';
      return false;
    }
    if (!this.reservationForm.purpose.trim()) {
      this.reservationError = 'Please provide a purpose';
      return false;
    }
    return true;
  }

  getMinDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  closeSuccessModal(): void {
    this.showSuccessModal = false;
  }
}