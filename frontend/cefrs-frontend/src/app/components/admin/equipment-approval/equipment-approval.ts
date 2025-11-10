import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EquipmentBorrowingService, EquipmentBorrowing } from '../../../services/equipment-borrowing.service';

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

  constructor(private borrowingService: EquipmentBorrowingService) {}

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
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedBorrowing = null;
    this.adminNotes = '';
    this.actualReturnDate = '';
  }

  submitApproval(): void {
    if (!this.selectedBorrowing) return;

    this.loading = true;
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
        this.error = err.error?.message || 'Failed to update borrowing status';
        console.error('Error updating borrowing:', err);
      }
    });
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString();
  }

  getMinDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }
}

