import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { EquipmentBorrowingService, BorrowingRequest } from '../../../services/equipment-borrowing.service';
import { EquipmentDTO, EquipmentService, SuggestedEquipmentResponse } from '../../../services/equipment.service';

interface Equipment {
  id: number;
  name: string;
  category: string;
  quantityTotal: number;
  quantityAvailable: number;
  description?: string;
  status: string;
}

@Component({
  selector: 'app-equipment-borrowing-request',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './equipment-borrowing-request.html',
  styleUrls: ['./equipment-borrowing-request.scss']
})
export class EquipmentBorrowingRequestComponent implements OnInit {
  equipment: Equipment[] = [];
  selectedEquipmentId: number | null = null;
  quantity: number = 1;
  borrowDate: string = '';
  expectedReturnDate: string = '';
  purpose: string = '';

  loading = false;
  error: string | null = null;
  success: string | null = null;
  
  // Bookings for the selected equipment within the selected range
  bookings: any[] = [];
  availableForRange: number | null = null;

  // Suggestions state
  showSuggestionsModal = false;
  suggestedEquipment: SuggestedEquipmentResponse | null = null;
  suggestionsLoading = false;

  constructor(
    private borrowingService: EquipmentBorrowingService,
    private equipmentService: EquipmentService,
    public router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    // Check if equipmentId is passed as query parameter
    this.route.queryParams.subscribe(params => {
      if (params['equipmentId']) {
        const equipmentId = parseInt(params['equipmentId'], 10);
        if (!isNaN(equipmentId)) {
          this.selectedEquipmentId = equipmentId;
        }
      }
    });

    this.loadEquipment();
  }

  // Called when equipment or dates change to refresh bookings/availability
  onSelectionChange(): void {
    this.error = null;
    this.success = null;
    this.bookings = [];
    this.availableForRange = null;

    if (!this.selectedEquipmentId || !this.borrowDate || !this.expectedReturnDate) return;

    this.equipmentService.getEquipmentBookings(this.selectedEquipmentId, this.borrowDate, this.expectedReturnDate)
      .subscribe({
        next: (list) => {
          this.bookings = list || [];
          // Only count approved borrowings against availability
          const reserved = this.bookings.reduce((sum: number, b: any) => {
            const status = (b.status || '').toString().toUpperCase();
            if (status === 'APPROVED') {
              return sum + (b.quantity || 0);
            }
            return sum;
          }, 0);
          const selected = this.getSelectedEquipment();
          if (selected) {
            this.availableForRange = selected.quantityTotal - reserved;
          }
        },
        error: (err) => {
          console.error('Error fetching bookings:', err);
        }
      });
  }

  loadEquipment(): void {
    this.equipmentService.getAvailableEquipment().subscribe({
      next: (equipmentList: EquipmentDTO[]) => {
        this.equipment = equipmentList.filter(eq => eq.quantityAvailable > 0);
      },
      error: (err) => {
        console.error('Error loading equipment:', err);
        this.error = 'Failed to load equipment';
      }
    });
  }

  getSelectedEquipment(): Equipment | undefined {
    return this.equipment.find(eq => eq.id === this.selectedEquipmentId);
  }

  getMaxQuantity(): number {
    const selected = this.getSelectedEquipment();
    return selected ? selected.quantityAvailable : 0;
  }

  onSubmit(): void {
    if (!this.validateForm()) {
      return;
    }
    // If availability for the selected date range is known and insufficient, block submit
    if (this.availableForRange !== null && this.quantity > this.availableForRange) {
      this.error = `Only ${this.availableForRange} items available for the selected dates`;
      // Load suggestions for alternative equipment
      this.loadSuggestions();
      return;
    }

    this.loading = true;
    this.error = null;
    this.success = null;

    const request: BorrowingRequest = {
      equipmentId: this.selectedEquipmentId!,
      quantity: this.quantity,
      borrowDate: this.borrowDate,
      expectedReturnDate: this.expectedReturnDate,
      purpose: this.purpose
    };

    this.borrowingService.createBorrowing(request).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          // Use the message from the API response (which includes waitlist notification if applicable)
          this.success = response.message || 'Equipment borrowing request submitted successfully!';
          setTimeout(() => {
            this.router.navigate(['/student/my-borrowings']);
          }, response.data?.status?.toLowerCase() === 'waitlisted' ? 4000 : 2000);
        }
      },
      error: (err) => {
        this.loading = false;
        const msg = this.parseServerError(err) || 'Failed to submit borrowing request';
        this.error = msg;
        console.error('Error creating borrowing:', err);
        // Ensure the UI shows the no-availability alert block so the user can click "See Alternatives"
        this.availableForRange = 0;
        this.loadSuggestions();
    
      }
    });
  }

  loadSuggestions(): void {
    if (!this.selectedEquipmentId || !this.borrowDate || !this.expectedReturnDate) return;

    this.suggestionsLoading = true;
    this.suggestedEquipment = null;

    this.equipmentService.getSuggestedEquipment(this.selectedEquipmentId, this.borrowDate, this.expectedReturnDate)
      .subscribe({
        next: (resp: any) => {
          this.suggestionsLoading = false;
          if (resp && resp.success && resp.data) {
            this.suggestedEquipment = resp.data;
          } else {
            // Build an empty suggestions payload with reason message so modal can show helpful text
            this.suggestedEquipment = {
              unavailableEquipment: {
                id: this.selectedEquipmentId!,
                name: resp?.data?.unavailableEquipment?.name || 'Requested equipment',
                category: resp?.data?.unavailableEquipment?.category || '',
                quantityTotal: resp?.data?.unavailableEquipment?.quantityTotal || 0,
                quantityAvailable: resp?.data?.unavailableEquipment?.quantityAvailable || 0,
                description: resp?.data?.unavailableEquipment?.description || '',
                imageUrl: resp?.data?.unavailableEquipment?.imageUrl || '',
                status: resp?.data?.unavailableEquipment?.status || ''
              },
              requestedBorrowDate: this.borrowDate,
              requestedReturnDate: this.expectedReturnDate,
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
              id: this.selectedEquipmentId!,
              name: 'Requested equipment',
              category: '',
              quantityTotal: 0,
              quantityAvailable: 0,
              description: '',
              imageUrl: '',
              status: ''
            },
            requestedBorrowDate: this.borrowDate,
            requestedReturnDate: this.expectedReturnDate,
            reason: 'Failed to load alternatives. Please try again later.',
            suggestedEquipment: []
          };
          this.showSuggestionsModal = true;
        }
      });
  }

  selectSuggestedEquipment(equipmentId: number): void {
    // Try to find the equipment in the loaded list
    const found = this.equipment.find(eq => eq.id === equipmentId);
    if (!found && this.suggestedEquipment) {
      const suggested = this.suggestedEquipment.suggestedEquipment.find(s => s.id === equipmentId);
      if (suggested) {
        // Add to equipment list temporarily so form can use it
        this.equipment.unshift(suggested as any);
      }
    }

    // Preserve previously-entered details; fallback to suggestion payload if empty
    if (this.suggestedEquipment) {
      if (!this.borrowDate) this.borrowDate = this.suggestedEquipment.requestedBorrowDate || '';
      if (!this.expectedReturnDate) this.expectedReturnDate = this.suggestedEquipment.requestedReturnDate || '';
      if (!this.purpose) this.purpose = this.suggestedEquipment.reason || '';
    }

    this.selectedEquipmentId = equipmentId;
    this.showSuggestionsModal = false;
    // Refresh bookings/availability for the newly selected equipment
    setTimeout(() => this.onSelectionChange(), 50);
  }

  // Parse server error response to extract a useful message
  private parseServerError(err: any): string | null {
    try {
      // Common Spring Boot error shape { timestamp, status, error, message, path }
      if (err && err.error) {
        const e = err.error;
        if (typeof e === 'string') return e;
        if (e.message && typeof e.message === 'string') return e.message;
        // Some endpoints return ApiResponse-like object { success:false, message: '...' }
        if (e.data && e.data.message) return e.data.message;
        if (e.message && e.message.error) return e.message.error;
      }
      // Fallback to top-level message
      if (err && err.message) return err.message;
    } catch (ex) {
      // ignore parsing errors
    }
    return null;
  }

  validateForm(): boolean {
    if (!this.selectedEquipmentId) {
      this.error = 'Please select equipment';
      return false;
    }
    const selected = this.getSelectedEquipment();
    if (this.quantity > (selected?.quantityAvailable || 0)) {
      this.error = `Only ${selected?.quantityAvailable} items available`;
      return false;
    }
    if (this.quantity < 1) {
      this.error = 'Quantity must be at least 1';
      return false;
    }
    if (!this.borrowDate) {
      this.error = 'Please select a borrow date';
      return false;
    }
    if (!this.expectedReturnDate) {
      this.error = 'Please select an expected return date';
      return false;
    }
    if (this.expectedReturnDate <= this.borrowDate) {
      this.error = 'Return date must be after borrow date';
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
    this.router.navigate(['/student-dashboard']);
  }
}

