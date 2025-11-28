import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EquipmentBorrowingService, EquipmentBorrowing } from '../../../services/equipment-borrowing.service';
import { EquipmentService } from '../../../services/equipment.service';

@Component({
  selector: 'app-equipment-approval',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './equipment-approval.html',
  styleUrls: ['./equipment-approval.scss']
})
export class EquipmentApprovalComponent implements OnInit {
  borrowings: EquipmentBorrowing[] = [];
  loading = false;
  error: string | null = null;
  selectedBorrowing: EquipmentBorrowing | null = null;
  approvalStatus: string = 'APPROVED';
  adminNotes: string = '';
  actualReturnDate: string = '';
  showModal = false;

  // Booking and availability info
  bookings: any[] = [];
  availableForRange: number | null = null;
  equipmentTotal: number = 0;

  constructor(
    private borrowingService: EquipmentBorrowingService,
    private equipmentService: EquipmentService
  ) {}

  ngOnInit(): void {
    this.loadPendingBorrowings();
  }

  loadPendingBorrowings(): void {
    this.loading = true;
    this.borrowingService.getPendingBorrowings().subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success && response.data) {
          this.borrowings = response.data;
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Failed to load pending borrowings';
        console.error('Error loading borrowings:', err);
      }
    });
  }

  openApprovalModal(borrowing: EquipmentBorrowing): void {
    this.selectedBorrowing = borrowing;
    this.approvalStatus = 'APPROVED';
    this.adminNotes = '';
    this.actualReturnDate = '';
    this.error = null;
    this.bookings = [];
    this.availableForRange = null;
    this.showModal = true;

    // Fetch equipment details and bookings for the date range
    this.loadBookingsAndAvailability(borrowing);
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedBorrowing = null;
    this.adminNotes = '';
    this.actualReturnDate = '';
    this.error = null;
    this.bookings = [];
    this.availableForRange = null;
  }

  loadBookingsAndAvailability(borrowing: EquipmentBorrowing): void {
    // Fetch equipment details first
    this.equipmentService.getEquipmentById(borrowing.equipmentId).subscribe({
      next: (equipment) => {
        this.equipmentTotal = equipment.quantityTotal;

        // Fetch bookings for the requested date range
        this.equipmentService.getEquipmentBookings(
          borrowing.equipmentId,
          borrowing.borrowDate,
          borrowing.expectedReturnDate
        ).subscribe({
          next: (bookingList) => {
            this.bookings = bookingList || [];
            // Sum quantities already reserved (excluding this pending request)
            const reserved = this.bookings
              .filter((b: any) => b.id !== borrowing.id)
              .reduce((sum: number, b: any) => sum + (b.quantity || 0), 0);
            this.availableForRange = this.equipmentTotal - reserved;
          },
          error: (err) => {
            console.error('Error fetching bookings:', err);
          }
        });
      },
      error: (err) => {
        console.error('Error fetching equipment:', err);
      }
    });
  }

  submitApproval(): void {
    if (!this.selectedBorrowing) return;

    // Check availability before approving
    if (this.approvalStatus === 'APPROVED') {
      if (this.availableForRange !== null && this.selectedBorrowing.quantity > this.availableForRange) {
        this.error = `Cannot approve: Only ${this.availableForRange} items available for the selected dates`;
        return;
      }
    }

    this.loading = true;
    this.error = null;
    this.borrowingService.updateBorrowingStatus(
      this.selectedBorrowing.id,
      this.approvalStatus,
      this.adminNotes,
      this.actualReturnDate || undefined
    ).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.closeModal();
          this.loadPendingBorrowings();
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = this.parseServerError(err) || 'Failed to update borrowing status';
        console.error('Error updating borrowing:', err);
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

  getMinDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }
}

