import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EquipmentService, SuggestedEquipmentResponse } from '../../../../services/equipment.service';
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
  successMessage: string = 'Equipment request submitted successfully!';
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

  // Suggestions state
  showSuggestionsModal = false;
  suggestedEquipment: SuggestedEquipmentResponse | null = null;
  suggestionsLoading = false;

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
      next: (response: any) => {
        this.borrowingLoading = false;
        if (response.success) {
          // Use the message from the API response (which includes waitlist notification if applicable)
          this.successMessage = response.message || 'Equipment request submitted successfully!';
          this.closeEquipmentModal();
          this.showEquipmentSuccessModal = true;
          this.fetchEquipment();
        }
      },
      error: (err: any) => {
        this.borrowingLoading = false;
        const msg = this.parseServerError(err) || 'Failed to submit borrowing request';
        this.borrowingError = msg;
        console.error('Error creating borrowing:', err);
        this.loadSuggestions();
        
      }
    });
  }

  loadSuggestions(): void {
    const equipmentId = this.borrowingForm.equipmentId || this.selectedEquipment?.id;
    if (!equipmentId || !this.borrowingForm.borrowDate || !this.borrowingForm.expectedReturnDate) return;

    this.suggestionsLoading = true;
    this.suggestedEquipment = null;

    this.equipmentService.getSuggestedEquipment(equipmentId, this.borrowingForm.borrowDate, this.borrowingForm.expectedReturnDate)
      .subscribe({
        next: (resp: any) => {
          this.suggestionsLoading = false;
          if (resp && resp.success && resp.data) {
            this.suggestedEquipment = resp.data;
          } else {
            this.suggestedEquipment = {
              unavailableEquipment: {
                id: equipmentId,
                name: resp?.data?.unavailableEquipment?.name || this.selectedEquipment?.name || 'Requested equipment',
                category: resp?.data?.unavailableEquipment?.category || this.selectedEquipment?.category || '',
                quantityTotal: resp?.data?.unavailableEquipment?.quantityTotal || 0,
                quantityAvailable: resp?.data?.unavailableEquipment?.quantityAvailable || 0,
                description: resp?.data?.unavailableEquipment?.description || this.selectedEquipment?.description || '',
                imageUrl: resp?.data?.unavailableEquipment?.imageUrl || this.selectedEquipment?.imageUrl || '',
                status: resp?.data?.unavailableEquipment?.status || ''
              },
              requestedBorrowDate: this.borrowingForm.borrowDate,
              requestedReturnDate: this.borrowingForm.expectedReturnDate,
              reason: resp?.message || 'No alternatives found for the selected dates',
              suggestedEquipment: []
            };
          }
          this.showSuggestionsModal = true;
        },
        error: (err) => {
          this.suggestionsLoading = false;
          console.error('Error loading equipment suggestions:', err);
          this.suggestedEquipment = {
            unavailableEquipment: {
              id: equipmentId,
              name: this.selectedEquipment?.name || 'Requested equipment',
              category: this.selectedEquipment?.category || '',
              quantityTotal: 0,
              quantityAvailable: 0,
              description: '',
              imageUrl: '',
              status: ''
            },
            requestedBorrowDate: this.borrowingForm.borrowDate,
            requestedReturnDate: this.borrowingForm.expectedReturnDate,
            reason: 'Failed to load alternatives. Please try again later.',
            suggestedEquipment: []
          };
          this.showSuggestionsModal = true;
        }
      });
  }

  selectSuggestedEquipment(equipmentId: number): void {
    let equipment = this.equipment.find(e => e.id === equipmentId);
    if (!equipment && this.suggestedEquipment) {
      const suggested = this.suggestedEquipment.suggestedEquipment.find(s => s.id === equipmentId);
      if (suggested) {
        equipment = {
          id: suggested.id,
          name: suggested.name,
          description: suggested.description,
          category: suggested.category,
          quantityAvailable: suggested.quantityAvailable,
          quantityTotal: suggested.quantityTotal,
          imageUrl: suggested.imageUrl,
          status: suggested.status
        };
        this.equipment.unshift(equipment);
      }
    }

    if (equipment) {
      if (this.suggestedEquipment) {
        if (!this.borrowingForm.borrowDate) this.borrowingForm.borrowDate = this.suggestedEquipment.requestedBorrowDate || '';
        if (!this.borrowingForm.expectedReturnDate) this.borrowingForm.expectedReturnDate = this.suggestedEquipment.requestedReturnDate || '';
        if (!this.borrowingForm.purpose) this.borrowingForm.purpose = this.suggestedEquipment.reason || '';
      }

      this.selectedEquipment = equipment;
      this.borrowingForm.equipmentId = equipmentId;
      this.showSuggestionsModal = false;
      this.showEquipmentModal = true;
    }
  }

  // Parse common server error shapes and extract a useful message
  private parseServerError(err: any): string | null {
    try {
      if (!err) return null;
      // If backend returns { error: '...'}
      if (err.error && typeof err.error === 'object') {
        if (typeof err.error.error === 'string' && err.error.error.trim().length) return err.error.error;
        if (typeof err.error.message === 'string' && err.error.message.trim()) return err.error.message;
      }
      // If err.error is a plain string
      if (err.error && typeof err.error === 'string') return err.error;
      // Top-level message
      if (err.message && typeof err.message === 'string') return err.message;
    } catch (ex) {
      // ignore
    }
    return null;
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