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
          this.displayMessage('error', 'Failed to load equipment. Please refresh the page or contact support.');
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

  /**
   * Check if equipment can be deleted
   */
  canDeleteEquipment(item: EquipmentItem): boolean {
    // Cannot delete if any items are borrowed
    return item.quantityAvailable === item.quantityTotal && item.status !== 'BORROWED';
  }

  /**
   * Get reason why equipment cannot be deleted
   */
  getDeleteBlockReason(item: EquipmentItem): string {
    if (item.quantityAvailable < item.quantityTotal) {
      const borrowedCount = item.quantityTotal - item.quantityAvailable;
      return `${borrowedCount} item(s) are currently borrowed.`;
    }
    if (item.status === 'BORROWED') {
      return 'This equipment is currently borrowed.';
    }
    return '';
  }

  deleteEquipment(item: EquipmentItem): void {
    // Frontend validation - check if any items are borrowed
    const borrowedCount = item.quantityTotal - item.quantityAvailable;

    if (borrowedCount > 0) {
      this.displayMessage(
        'error',
        `Cannot delete "${item.name}" because ${borrowedCount} item(s) are currently borrowed. ` +
        'Please wait for all items to be returned before deleting this equipment.'
      );
      return;
    }

    if (item.status === 'BORROWED') {
      this.displayMessage(
        'error',
        `Cannot delete "${item.name}" because it is marked as borrowed. ` +
        'Please wait for all items to be returned before attempting to delete.'
      );
      return;
    }

    if (item.status === 'UNAVAILABLE') {
      this.displayMessage(
        'error',
        `Cannot delete "${item.name}" because it is marked as unavailable. ` +
        'This may indicate active borrowings or maintenance. Please check the equipment status first.'
      );
      return;
    }

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
    // Trim all text fields
    const trimmedName = this.equipmentForm.name.trim();
    const trimmedDescription = this.equipmentForm.description.trim();
    const trimmedImageUrl = this.equipmentForm.imageUrl.trim();

    // Validate required fields
    if (!trimmedName) {
      this.displayMessage('error', 'Equipment name is required. Please enter a name for this equipment.');
      return;
    }

    if (this.equipmentForm.quantityTotal <= 0) {
      this.displayMessage('error', 'Quantity must be greater than 0. Please enter a valid quantity.');
      return;
    }

    // Validate image URL if provided
    if (trimmedImageUrl && !this.isValidUrl(trimmedImageUrl)) {
      this.displayMessage('error', 'Invalid image URL. Please enter a valid URL starting with http:// or https://');
      return;
    }

    // Check for duplicate names (frontend validation)
    const duplicateName = this.equipment.find(e =>
      e.name.toLowerCase().trim() === trimmedName.toLowerCase() &&
      e.id !== this.equipmentForm.id
    );

    if (duplicateName) {
      this.displayMessage(
        'error',
        `Equipment named "${trimmedName}" already exists. Please choose a different name.`
      );
      return;
    }

    // Additional validation for edit mode - check if reducing quantity below borrowed
    if (this.isEditMode && this.selectedEquipment) {
      const currentBorrowed = this.selectedEquipment.quantityTotal - this.selectedEquipment.quantityAvailable;
      if (this.equipmentForm.quantityTotal < currentBorrowed) {
        this.displayMessage(
          'error',
          `Cannot reduce quantity to ${this.equipmentForm.quantityTotal} because ${currentBorrowed} item(s) are currently borrowed. ` +
          'Please ensure the new quantity is at least equal to the number of borrowed items.'
        );
        return;
      }
    }

    const requestData: EquipmentRequestDTO = {
      name: trimmedName,
      category: this.equipmentForm.category,
      quantityTotal: this.equipmentForm.quantityTotal,
      description: trimmedDescription,
      imageUrl: trimmedImageUrl,
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
            this.displayMessage('success', `Equipment "${trimmedName}" has been updated successfully!`);
          },
          error: (error) => {
            console.error('Error updating equipment:', error);
            const errorMessage = this.parseUpdateError(error, trimmedName);
            this.displayMessage('error', errorMessage);
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
            this.displayMessage('success', `Equipment "${trimmedName}" has been created successfully!`);
          },
          error: (error) => {
            console.error('Error creating equipment:', error);
            const errorMessage = this.parseUpdateError(error, trimmedName);
            this.displayMessage('error', errorMessage);
          }
        });
    }
  }

  private parseUpdateError(error: any, equipmentName: string): string {
    console.error('Update error details:', error);

    // Try to extract error message from various formats
    let errorMessage = this.extractErrorMessage(error);

    if (errorMessage) {
      const lowerError = errorMessage.toLowerCase();

      // Check for specific error patterns
      if (lowerError.includes('duplicate') || lowerError.includes('already exists') || lowerError.includes('unique constraint')) {
        return `Equipment named "${equipmentName}" already exists in the system. Please choose a different name.`;
      }

      if (lowerError.includes('quantity') && lowerError.includes('borrowed')) {
        return `Cannot reduce quantity: Some items are currently borrowed. ` +
          'The new quantity must be at least equal to the number of borrowed items. ' +
          'Please wait for items to be returned or increase the quantity.';
      }

      if (lowerError.includes('quantity') && lowerError.includes('reduce')) {
        return `Cannot reduce quantity below the number of items currently borrowed. ` +
          'Please ensure all borrowed items can fit within the new quantity.';
      }

      if (lowerError.includes('borrowed') || lowerError.includes('borrow')) {
        return `Cannot modify this equipment because items are currently borrowed. ` +
          'Please wait for all items to be returned before making changes.';
      }

      if (lowerError.includes('invalid') && lowerError.includes('quantity')) {
        return 'The quantity value is invalid. Please enter a positive number.';
      }

      if (lowerError.includes('invalid') && lowerError.includes('category')) {
        return 'The selected category is invalid. Please choose a valid category.';
      }

      if (lowerError.includes('invalid') && lowerError.includes('status')) {
        return 'The selected status is invalid. Please choose a valid status option.';
      }

      // Return server message if it's descriptive and reasonable length
      if (errorMessage.length >= 15 && errorMessage.length <= 200) {
        return errorMessage;
      }
    }

    // Status code based messages
    if (error.status === 400) {
      return 'Invalid data provided. Please check that all required fields are filled correctly and try again.';
    }

    if (error.status === 409) {
      return `Cannot save changes to "${equipmentName}" due to a conflict. ` +
        'This equipment may have active borrowings or reservations that prevent modifications. ' +
        'Please check the equipment status and try again.';
    }

    if (error.status === 422) {
      return 'The data provided cannot be processed. Please verify all fields are correct.';
    }

    if (error.status === 500) {
      return 'A server error occurred while saving the equipment. Please try again or contact support if the problem persists.';
    }

    // Default error message
    return `Failed to save equipment "${equipmentName}". Please verify all information is correct and try again. ` +
      'If the problem persists, contact support for assistance.';
  }

  confirmDelete(): void {
    if (this.selectedEquipment) {
      const equipmentName = this.selectedEquipment.name;

      this.equipmentService.deleteEquipment(this.selectedEquipment.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadEquipment();
            this.closeDeleteModal();
            this.displayMessage('success', `Equipment "${equipmentName}" has been deleted successfully.`);
          },
          error: (error) => {
            console.error('Error deleting equipment:', error);
            const errorMessage = this.parseDeleteError(error, equipmentName);
            this.closeDeleteModal(); // Close modal even on error
            this.displayMessage('error', errorMessage);
          }
        });
    }
  }

  private parseDeleteError(error: any, equipmentName: string): string {
    console.error('Delete error details:', error);

    // Try to extract error message from various formats
    let errorMessage = this.extractErrorMessage(error);

    if (errorMessage) {
      const lowerError = errorMessage.toLowerCase();

      // Check for specific error patterns
      if (lowerError.includes('borrowed') || lowerError.includes('borrow')) {
        return `Cannot delete "${equipmentName}" because items are currently borrowed. ` +
          'Please wait for all items to be returned before attempting to delete this equipment.';
      }

      if (lowerError.includes('in use') || lowerError.includes('active')) {
        return `Cannot delete "${equipmentName}" because it is currently in use. ` +
          'Please ensure all items are returned and try again.';
      }

      if (lowerError.includes('reserved') || lowerError.includes('reservation')) {
        return `Cannot delete "${equipmentName}" because it has active reservations or bookings. ` +
          'Please cancel all reservations before deleting.';
      }

      if (lowerError.includes('foreign key') || lowerError.includes('constraint') || lowerError.includes('reference')) {
        return `Cannot delete "${equipmentName}" because it has related records (such as borrowing history or reservations). ` +
          'Please remove all related records first or contact support for assistance.';
      }

      if (lowerError.includes('dependency') || lowerError.includes('dependent')) {
        return `Cannot delete "${equipmentName}" because other records depend on it. ` +
          'Please remove dependent records first.';
      }

      // Return server message if it's descriptive and reasonable length
      if (errorMessage.length >= 15 && errorMessage.length <= 200) {
        return errorMessage;
      }
    }

    // Status code based messages
    if (error.status === 409) {
      return `Cannot delete "${equipmentName}" because it has active borrowings or dependencies. ` +
        'Please ensure all items are returned and no other records reference this equipment.';
    }

    if (error.status === 400) {
      return `Cannot delete "${equipmentName}". This equipment may be in use or have active borrowings. ` +
        'Please check the equipment status and try again.';
    }

    if (error.status === 500) {
      return `Cannot delete "${equipmentName}" due to a server error. ` +
        'This equipment likely has borrowing history or related records that must be handled first. ' +
        'Please contact support if you need assistance.';
    }

    // Default error message
    return `Failed to delete "${equipmentName}". This equipment may have active borrowings or dependencies. ` +
      'Please ensure all items are returned and try again. If the problem persists, contact support.';
  }

  /**
   * Extract error message from various error response formats
   */
  private extractErrorMessage(error: any): string {
    // Check error.error (can be string or object)
    if (error.error) {
      if (typeof error.error === 'string') {
        return error.error.trim();
      }
      if (error.error.message) {
        return error.error.message.trim();
      }
      if (error.error.error) {
        return error.error.error.trim();
      }
    }

    // Check error.message
    if (error.message && typeof error.message === 'string') {
      return error.message.trim();
    }

    // Check statusText
    if (error.statusText && typeof error.statusText === 'string') {
      return error.statusText.trim();
    }

    return '';
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