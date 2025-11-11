import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { EquipmentBorrowingService, BorrowingRequest } from '../../../services/equipment-borrowing.service';
import { EquipmentDTO, EquipmentService } from '../../../services/equipment.service';

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
  selector: 'app-org-equipment-borrowing-request',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './org-equipment-borrowing-request.html',
  styleUrls: ['./org-equipment-borrowing-request.scss']
})
export class OrgEquipmentBorrowingRequestComponent implements OnInit {
  equipment: Equipment[] = [];
  selectedEquipmentId: number | null = null;
  quantity: number = 1;
  borrowDate: string = '';
  expectedReturnDate: string = '';
  purpose: string = '';

  loading = false;
  error: string | null = null;
  success: string | null = null;

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
          this.success = 'Equipment borrowing request submitted successfully!';
          setTimeout(() => {
            this.router.navigate(['/org/my-borrowings']);
          }, 2000);
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Failed to submit borrowing request';
        console.error('Error creating borrowing:', err);
      }
    });
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
    this.router.navigate(['/org-dashboard']);
  }
}

