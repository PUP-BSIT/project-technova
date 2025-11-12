import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EquipmentService } from '../../../../services/equipment.service';
import { EquipmentBorrowingService, BorrowingRequest } from '../../../../services/equipment-borrowing.service';

interface Equipments {
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
  selector: 'app-equipment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './equipment.html',
  styleUrls: ['./equipment.scss']
})
export class Equipment implements OnInit {
  private equipmentService = inject(EquipmentService);
  private borrowingService = inject(EquipmentBorrowingService);

  equipment: Equipments[] = [];
  isLoadingEquipment = false;
  searchQuery = '';
  selectedCategory = 'All Categories';

  // Modal state
  showEquipmentModal = false;
  showEquipmentSuccessModal = false;
  selectedEquipment: Equipments | null = null;
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
      next: (equipmentList) => {
        this.equipment = equipmentList;
        this.isLoadingEquipment = false;
      },
      error: (err) => {
        console.error('Error fetching equipment:', err);
        this.isLoadingEquipment = false;
      }
    });
  }

  get filteredEquipment(): Equipments[] {
    let filtered = this.equipment;

    if (this.selectedCategory !== 'All Categories') {
      filtered = filtered.filter(item =>
        item.category?.toUpperCase() === this.selectedCategory.toUpperCase()
      );
    }

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

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      Available: 'status-available',
      AVAILABLE: 'status-available',
      Reserved: 'status-reserved'
    };
    return map[status] || '';
  }

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

  getMaxBorrowingQuantity(): number {
    return this.selectedEquipment?.quantityAvailable || 0;
  }

  getMinDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  closeEquipmentSuccessModal(): void {
    this.showEquipmentSuccessModal = false;
  }
}