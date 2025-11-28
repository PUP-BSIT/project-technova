import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReservationService, Reservation } from '../../../services/reservation.service';
import { FacilityService } from '../../../services/facility.service';

@Component({
  selector: 'app-reservation-approval',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reservation-approval.html',
  styleUrls: ['./reservation-approval.scss']
})
export class ReservationApprovalComponent implements OnInit {
  reservations: Reservation[] = [];
  loading = false;
  error: string | null = null;
  selectedReservation: Reservation | null = null;
  approvalStatus: string = 'APPROVED';
  adminNotes: string = '';
  showModal = false;

  // Conflicts for the selected reservation
  conflicts: any[] = [];

  constructor(
    private reservationService: ReservationService,
    private facilityService: FacilityService
  ) {}

  ngOnInit(): void {
    this.loadPendingReservations();
  }

  loadPendingReservations(): void {
    this.loading = true;
    this.reservationService.getPendingReservations().subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success && response.data) {
          this.reservations = response.data;
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Failed to load pending reservations';
        console.error('Error loading reservations:', err);
      }
    });
  }

  openApprovalModal(reservation: Reservation): void {
    this.selectedReservation = reservation;
    this.approvalStatus = 'APPROVED';
    this.adminNotes = '';
    this.error = null;
    this.conflicts = [];
    this.showModal = true;

    // Fetch conflicts for this facility and time slot
    this.loadConflicts(reservation);
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedReservation = null;
    this.adminNotes = '';
    this.error = null;
    this.conflicts = [];
  }

  loadConflicts(reservation: Reservation): void {
    this.facilityService.getFacilityConflicts(
      reservation.facilityId,
      reservation.reservationDate,
      reservation.startTime,
      reservation.endTime
    ).subscribe({
      next: (conflictList) => {
        // Filter out this reservation if it appears in conflicts
        this.conflicts = (conflictList || []).filter((c: any) => c.id !== reservation.id);
      },
      error: (err) => {
        console.error('Error fetching conflicts:', err);
      }
    });
  }

  submitApproval(): void {
    if (!this.selectedReservation) return;

    // Check conflicts before approving
    if (this.approvalStatus === 'APPROVED' && this.conflicts.length > 0) {
      this.error = `Cannot approve: Time slot conflicts with ${this.conflicts.length} existing reservation(s)`;
      return;
    }

    this.loading = true;
    this.error = null;
    this.reservationService.updateReservationStatus(
      this.selectedReservation.id,
      this.approvalStatus,
      this.adminNotes
    ).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.closeModal();
          this.loadPendingReservations();
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = this.parseServerError(err) || 'Failed to update reservation status';
        console.error('Error updating reservation:', err);
      }
    });
  }

  private parseServerError(err: any): string | null {
    try {
      if (!err) return null;
      if (err.error && typeof err.error === 'object') {
        if (typeof err.error.error === 'string' && err.error.error.trim().length) return err.error.error;
        if (typeof err.error.message === 'string' && err.error.message.trim()) return err.error.message;
      }
      if (err.error && typeof err.error === 'string') return err.error;
      if (err.message && typeof err.message === 'string') return err.message;
    } catch (ex) {
      // ignore
    }
    return null;
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString();
  }
}

