import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReservationService, Reservation } from '../../../services/reservation.service';

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

  constructor(private reservationService: ReservationService) {}

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
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedReservation = null;
    this.adminNotes = '';
  }

  submitApproval(): void {
    if (!this.selectedReservation) return;

    this.loading = true;
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
        this.error = err.error?.message || 'Failed to update reservation status';
        console.error('Error updating reservation:', err);
      }
    });
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString();
  }
}

