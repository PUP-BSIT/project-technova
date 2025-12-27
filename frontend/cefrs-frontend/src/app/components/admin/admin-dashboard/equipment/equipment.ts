import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { EquipmentService, EquipmentDTO, EquipmentRequestDTO } from '../../../../services/equipment.service';

interface EquipmentItem {
  id: number;
  name: string;
  category: string;
  quantityTotal: number;
  quantityAvailable: number;
  description: string;
  imageUrl?: string;
  status: string;
}

@Component({
  selector: 'app-equipment',
  templateUrl: './equipment.html',
  styleUrls: ['./equipment.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class Equipment implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  searchText: string = '';
  showAddEditModal: boolean = false;
  showDeleteModal: boolean = false;
  showMessageModal: boolean = false;
  messageType: 'success' | 'error' = 'success';
  messageText: string = '';
  isEditMode: boolean = false;
  selectedEquipment: EquipmentItem | null = null;
  imageLoadError: boolean = false;
  isLoading: boolean = false;

  // Form fields
  equipmentForm = {
    id: 0,
    name: '',
    category: 'AUDIO',
    quantityTotal: 1,
    description: '',
    imageUrl: '',
    status: 'AVAILABLE'
  };

  equipment: EquipmentItem[] = [];

  // Search and filters
  selectedCategory: string = 'All Categories';
  selectedCondition: string = 'All Conditions';
  selectedAvailability: string = 'All Availability';

  constructor(private equipmentService: EquipmentService) { }

  clearSearch(): void {
    this.searchText = '';
  }

  ngOnInit(): void {
    this.loadEquipment();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /* Format equipment ID as EQP-0001 */
  formatEquipmentId(id: number): string {
    return `EQP-${id.toString().padStart(4, '0')}`;
  }

  private displayMessage(type: 'success' | 'error', message: string): void {
    this.messageType = type;
    this.messageText = message;
    this.showMessageModal = true;
  }

  closeMessageModal(): void {
    this.showMessageModal = false;
  }

  loadEquipment(): void {
    this.isLoading = true;
    this.equipmentService.getAllEquipment()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (equipmentList) => {
          this.equipment = equipmentList.map(e => ({
            id: e.id,
            name: e.name,
            category: e.category,
            quantityTotal: e.quantityTotal,
            quantityAvailable: e.quantityAvailable,
            description: e.description,
            imageUrl: e.imageUrl,
            status: e.status
          }));
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading equipment:', error);
          this.isLoading = false;
          this.displayMessage('error', 'Failed to load equipment');
        }
      });
  }

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'AVAILABLE': 'Available',
      'BORROWED': 'Borrowed',
      'UNAVAILABLE': 'Unavailable'
    };
    return statusMap[status] || status;
  }

  getAvailabilityText(item: EquipmentItem): string {
    if (item.status === 'BORROWED') {
      if (item.quantityAvailable === 0) {
        return 'All Borrowed';
      } else {
        return `Partially Borrowed (${item.quantityAvailable}/${item.quantityTotal} available)`;
      }
    }
    if (item.status === 'UNAVAILABLE') {
      return 'Unavailable';
    }
    return 'Available';
  }

  getConditionFromQuantity(item: EquipmentItem): string {
    const percentAvailable = (item.quantityAvailable / item.quantityTotal) * 100;
    if (percentAvailable === 100) return 'Good';
    if (percentAvailable >= 50) return 'Fair';
    return 'Low Stock';
  }

  addNewEquipment(): void {
    this.isEditMode = false;
    this.equipmentForm = {
      id: 0,
      name: '',
      category: 'AUDIO',
      quantityTotal: 1,
      description: '',
      imageUrl: '',
      status: 'AVAILABLE'
    };
    this.imageLoadError = false;
    this.showAddEditModal = true;
  }

  editEquipment(item: EquipmentItem): void {
    this.isEditMode = true;
    this.selectedEquipment = item;
    this.equipmentForm = {
      id: item.id,
      name: item.name,
      category: item.category,
      quantityTotal: item.quantityTotal,
      description: item.description || '',
      imageUrl: item.imageUrl || '',
      status: item.status
    };
    this.imageLoadError = false;
    this.showAddEditModal = true;
  }

  deleteEquipment(item: EquipmentItem): void {
    this.selectedEquipment = item;
    this.showDeleteModal = true;
  }

  isValidUrl(url: string): boolean {
    if (!url || url.trim() === '') return false;
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  }

  onImageError(): void {
    this.imageLoadError = true;
  }

  onImageLoad(): void {
    this.imageLoadError = false;
  }

  saveAddEdit(): void {
    const requestData: EquipmentRequestDTO = {
      name: this.equipmentForm.name,
      category: this.equipmentForm.category,
      quantityTotal: this.equipmentForm.quantityTotal,
      description: this.equipmentForm.description,
      imageUrl: this.equipmentForm.imageUrl.trim(),
      status: this.equipmentForm.status
    };

    if (this.isEditMode && this.equipmentForm.id) {
      // Update existing equipment
      this.equipmentService.updateEquipment(this.equipmentForm.id, requestData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadEquipment();
            this.closeAddEditModal();
            this.displayMessage('success', 'Equipment updated successfully!');
          },
          error: (error) => {
            console.error('Error updating equipment:', error);
            this.displayMessage('error', 'Failed to update equipment');
          }
        });
    } else {
      // Add new equipment
      this.equipmentService.createEquipment(requestData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadEquipment();
            this.closeAddEditModal();
            this.displayMessage('success', 'Equipment created successfully!');
          },
          error: (error) => {
            console.error('Error creating equipment:', error);
            this.displayMessage('error', 'Failed to create equipment');
          }
        });
    }
  }

  confirmDelete(): void {
    if (this.selectedEquipment) {
      this.equipmentService.deleteEquipment(this.selectedEquipment.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadEquipment();
            this.closeDeleteModal();
            this.displayMessage('success', 'Equipment deleted successfully!');
          },
          error: (error) => {
            console.error('Error deleting equipment:', error);
            this.displayMessage('error', 'Failed to delete equipment');
          }
        });
    }
  }

  closeAddEditModal(): void {
    this.showAddEditModal = false;
    this.selectedEquipment = null;
    this.isEditMode = false;
    this.imageLoadError = false;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.selectedEquipment = null;
  }

  isFormValid(): boolean {
    return !!(
      this.equipmentForm.name.trim() &&
      this.equipmentForm.quantityTotal > 0
    );
  }

  get filteredEquipment(): EquipmentItem[] {
    let filtered = [...this.equipment];

    // Filter by search text
    if (this.searchText.trim()) {
      const query = this.searchText.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.id.toString().toLowerCase().includes(query) ||
        this.formatEquipmentId(item.id).toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (this.selectedCategory !== 'All Categories') {
      filtered = filtered.filter(item =>
        item.category === this.selectedCategory
      );
    }

    // Filter by condition
    if (this.selectedCondition !== 'All Conditions') {
      filtered = filtered.filter(item => {
        const condition = this.getConditionFromQuantity(item);
        return condition === this.selectedCondition;
      });
    }

    // Filter by availability
    if (this.selectedAvailability !== 'All Availability') {
      if (this.selectedAvailability === 'Available') {
        filtered = filtered.filter(item => item.quantityAvailable > 0);
      } else if (this.selectedAvailability === 'Borrowed') {
        filtered = filtered.filter(item => item.quantityAvailable === 0);
      }
    }

    return filtered.filter((item, index, self) =>
      index === self.findIndex(t => t.id === item.id)
    );
  }
}