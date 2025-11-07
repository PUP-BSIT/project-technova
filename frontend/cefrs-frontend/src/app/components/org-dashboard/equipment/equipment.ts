import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EquipmentService } from '../../../services/equipment.service';
import { EquipmentBorrowingService, BorrowingRequest } from '../../../services/equipment-borrowing.service';

interface Equipment {
  id: number;
  name: string;
  description: string;
  category: string;
  quantityAvailable: number;
  quantityTotal: number;
  imageUrl: string;
  status: string;
}

@Component({
  selector: 'app-org-equipment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './equipment.html',
  styleUrls: ['./equipment.scss']
})
export class OrgEquipmentComponent implements OnInit {
  private equipmentService = inject(EquipmentService);
  private borrowingService = inject(EquipmentBorrowingService);

  searchQuery = '';
  selectedCategory = 'All Categories';
  isLoadingEquipment = false;

  equipment: Equipment[] = [];

  // Modal state
  showEquipmentModal = false;
  showEquipmentSuccessModal = false;
  selectedEquipment: Equipment | null = null;
  borrowingForm = {
    equipmentId: null as number | null,
    quantity: 1,
    borrowDate: '',
    expectedReturnDate: '',
    purpose: ''
  };
  borrowingLoading = false;
  borrowingError: string | null = null;

  ngOnInit(): void {
    this.fetchEquipment();
  }

  fetchEquipment(): void {
    this.isLoadingEquipment = true;
    this.equipmentService.getAvailableEquipment().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.equipment = response.data;
        }
        this.isLoadingEquipment = false;
      },
      error: (err) => {
        console.error('Error fetching equipment:', err);
        this.isLoadingEquipment = false;
        this.equipment = [];
      }
    });
  }

  get filteredEquipment(): Equipment[] {
    let filtered = this.equipment;

    // Filter by category
    if (this.selectedCategory !== 'All Categories') {
      filtered = filtered.filter(item =>
        item.category?.toUpperCase() === this.selectedCategory.toUpperCase()
      );
    }

    // Filter by search query
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.name?.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }

  // Open equipment borrowing modal
  requestEquipment(equipmentId: number): void {
    const equipment = this.equipment.find(e => e.id === equipmentId);
    if (equipment && equipment.quantityAvailable > 0) {
      this.selectedEquipment = equipment;
      this.borrowingForm.equipmentId = equipmentId;
      this.borrowingForm.quantity = 1;
      this.borrowingForm.borrowDate = '';
      this.borrowingForm.expectedReturnDate = '';
      this.borrowingForm.purpose = '';
      this.borrowingError = null;
      this.showEquipmentModal = true;
    }
  }

  // Close equipment borrowing modal
  closeEquipmentModal(): void {
    this.showEquipmentModal = false;
    this.selectedEquipment = null;
    this.borrowingForm = {
      equipmentId: null,
      quantity: 1,
      borrowDate: '',
      expectedReturnDate: '',
      purpose: ''
    };
    this.borrowingError = null;
  }

  // Submit equipment borrowing request
  submitBorrowing(): void {
    if (!this.validateBorrowingForm()) {
      return;
    }

    this.borrowingLoading = true;
    this.borrowingError = null;

    const request: BorrowingRequest = {
      equipmentId: this.borrowingForm.equipmentId!,
      quantity: this.borrowingForm.quantity,
      borrowDate: this.borrowingForm.borrowDate,
      expectedReturnDate: this.borrowingForm.expectedReturnDate,
      purpose: this.borrowingForm.purpose
    };

    this.borrowingService.createBorrowing(request).subscribe({
      next: (response) => {
        this.borrowingLoading = false;
        if (response.success) {
          this.closeEquipmentModal();
          this.showEquipmentSuccessModal = true;
          // Refresh equipment list
          this.fetchEquipment();
        }
      },
      error: (err) => {
        this.borrowingLoading = false;
        this.borrowingError = err.error?.message || 'Failed to submit borrowing request';
        console.error('Error creating borrowing:', err);
      }
    });
  }

  // Validate borrowing form
  validateBorrowingForm(): boolean {
    if (!this.borrowingForm.equipmentId) {
      this.borrowingError = 'Please select equipment';
      return false;
    }
    const selected = this.selectedEquipment;
    if (this.borrowingForm.quantity > (selected?.quantityAvailable || 0)) {
      this.borrowingError = `Only ${selected?.quantityAvailable} items available`;
      return false;
    }
    if (this.borrowingForm.quantity < 1) {
      this.borrowingError = 'Quantity must be at least 1';
      return false;
    }
    if (!this.borrowingForm.borrowDate) {
      this.borrowingError = 'Please select a borrow date';
      return false;
    }
    if (!this.borrowingForm.expectedReturnDate) {
      this.borrowingError = 'Please select an expected return date';
      return false;
    }
    if (this.borrowingForm.expectedReturnDate <= this.borrowingForm.borrowDate) {
      this.borrowingError = 'Return date must be after borrow date';
      return false;
    }
    if (!this.borrowingForm.purpose.trim()) {
      this.borrowingError = 'Please provide a purpose';
      return false;
    }
    return true;
  }

  // Get max quantity for selected equipment
  getMaxBorrowingQuantity(): number {
    return this.selectedEquipment?.quantityAvailable || 0;
  }

  // Get minimum date for date picker
  getMinDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  // Get status class
  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      Approved: 'status-approved',
      Pending: 'status-pending',
      Rejected: 'status-rejected',
      Returned: 'status-returned',
      Available: 'status-available',
      AVAILABLE: 'status-available',
      Reserved: 'status-reserved'
    };
    return map[status] || '';
  }

  // Close equipment success modal
  closeEquipmentSuccessModal(): void {
    this.showEquipmentSuccessModal = false;
  }
}

