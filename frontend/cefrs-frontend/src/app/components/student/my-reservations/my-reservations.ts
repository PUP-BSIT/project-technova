import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ReservationService, Reservation } from '../../../services/reservation.service';

@Component({
  selector: 'app-my-reservations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-reservations.html',
  styleUrls: ['./my-reservations.scss']
})
export class MyReservationsComponent implements OnInit {
  reservations: Reservation[] = [];
  loading = false;
  error: string | null = null;
  searchQuery = '';
  selectedStatus = 'All';

  constructor(
    private reservationService: ReservationService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.loadReservations();
  }

  loadReservations(): void {
    this.loading = true;
    this.reservationService.getMyReservations().subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success && response.data) {
          this.reservations = response.data;
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Failed to load reservations';
        console.error('Error loading reservations:', err);
      }
    });
  }

  get filteredReservations(): Reservation[] {
    let filtered = this.reservations;

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(r =>
        r.facilityName.toLowerCase().includes(query) ||
        r.purpose.toLowerCase().includes(query)
      );
    }

    if (this.selectedStatus !== 'All') {
      filtered = filtered.filter(r => r.status === this.selectedStatus);
    }

    return filtered.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  getStatusClass(status: string): string {
    const statusMap: Record<string, string> = {
      'PENDING': 'status-pending',
      'APPROVED': 'status-approved',
      'REJECTED': 'status-rejected',
      'CANCELLED': 'status-cancelled',
      'COMPLETED': 'status-completed'
    };
    return statusMap[status] || '';
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString();
  }

  formatDateTime(dateStr: string, timeStr: string): string {
    return `${new Date(dateStr).toLocaleDateString()} ${timeStr}`;
  }

  cancelReservation(id: number): void {
    if (confirm('Are you sure you want to cancel this reservation?')) {
      this.reservationService.cancelReservation(id).subscribe({
        next: () => {
          this.loadReservations();
        },
        error: (err) => {
          console.error('Error cancelling reservation:', err);
          alert('Failed to cancel reservation');
        }
      });
    }
  }

  canCancel(status: string): boolean {
    return status === 'PENDING' || status === 'APPROVED';
  }

  navigateToRequest(): void {
    this.router.navigate(['/student/reservation-request']);
  }
}

