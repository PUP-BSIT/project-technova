import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { FacilityService, FacilityDTO } from '../../../../services/facility.service';

interface Facility {
  id: number;
  name: string;
  type: string;
  building: string;
  floor: string;
  capacity: number;
  description: string;
  status: string;
  imageUrl?: string;
}

@Component({
  selector: 'app-facilities',
  templateUrl: './facilities.html',
  styleUrls: ['./facilities.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class Facilities implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  searchText: string = '';
  showAddEditModal: boolean = false;
  showDeleteModal: boolean = false;
  showMessageModal: boolean = false;
  messageType: 'success' | 'error' = 'success';
  messageText: string = '';
  isEditMode: boolean = false;
  selectedFacility: Facility | null = null;
  selectedFile: File | null = null;
  photoPreview: string | null = null;
  isLoading: boolean = false;

  // Form fields
  facilityForm = {
    id: 0,
    name: '',
    type: 'CLASSROOM',
    building: '',
    floor: '',
    capacity: 0,
    description: '',
    status: 'AVAILABLE',
    imageUrl: ''
  };

  facilities: Facility[] = [];
  selectedStatus: string = 'All Status';

  constructor(private facilityService: FacilityService) { }

  clearSearch(): void {
    this.searchText = '';
  }

  ngOnInit(): void {
    this.loadFacilities();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadFacilities(): void {
    this.isLoading = true;
    this.facilityService.getAllFacilities()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (facilities) => {
          this.facilities = facilities.map(f => ({
            id: f.id,
            name: f.name,
            type: f.type,
            building: f.building,
            floor: f.floor,
            capacity: f.capacity,
            description: f.description,
            status: f.status,
            imageUrl: f.imageUrl
          }));
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading facilities:', error);
          this.isLoading = false;
          this.displayMessage('error', 'Failed to load facilities. Please refresh the page or contact support.');
        }
      });
  }

  /* Format facility ID as FAC-0001 */
  formatFacilityId(id: number): string {
    return `FAC-${id.toString().padStart(4, '0')}`;
  }

  private displayMessage(type: 'success' | 'error', message: string): void {
    this.messageType = type;
    this.messageText = message;
    this.showMessageModal = true;
  }

  closeMessageModal(): void {
    this.showMessageModal = false;
  }

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'AVAILABLE': 'Available',
      'RESERVED': 'Reserved',
      'UNAVAILABLE': 'Unavailable'
    };
    return statusMap[status] || status;
  }

  addNewFacility(): void {
    this.isEditMode = false;
    this.facilityForm = {
      id: 0,
      name: '',
      type: 'CLASSROOM',
      building: '',
      floor: '',
      capacity: 0,
      description: '',
      status: 'AVAILABLE',
      imageUrl: ''
    };
    this.selectedFile = null;
    this.photoPreview = null;
    this.showAddEditModal = true;
  }

  editFacility(facility: Facility): void {
    this.isEditMode = true;
    this.selectedFacility = facility;
    this.facilityForm = {
      id: facility.id,
      name: facility.name,
      type: facility.type,
      building: facility.building,
      floor: facility.floor,
      capacity: facility.capacity,
      description: facility.description,
      status: facility.status,
      imageUrl: facility.imageUrl || ''
    };
    this.selectedFile = null;
    this.photoPreview = facility.imageUrl || null;
    this.showAddEditModal = true;
  }

  /**
   * Check if a facility can be deleted
   */
  canDeleteFacility(facility: Facility): boolean {
    return facility.status !== 'RESERVED';
  }

  /**
   * Get reason why facility cannot be deleted
   */
  getDeleteBlockReason(facility: Facility): string {
    if (facility.status === 'RESERVED') {
      return 'This facility is currently reserved and cannot be deleted.';
    }
    return '';
  }

  deleteFacility(facility: Facility): void {
    // Frontend validation - prevent delete if facility is reserved
    if (facility.status === 'RESERVED') {
      this.displayMessage(
        'error',
        `Cannot delete "${facility.name}" because it is currently reserved. ` +
        'Please cancel all active reservations first before attempting to delete this facility.'
      );
      return;
    }

    // Check if facility is unavailable (might have issues)
    if (facility.status === 'UNAVAILABLE') {
      this.displayMessage(
        'error',
        `Cannot delete "${facility.name}" because it is marked as unavailable. ` +
        'This may indicate active reservations or maintenance. Please check the facility status first.'
      );
      return;
    }

    this.selectedFacility = facility;
    this.showDeleteModal = true;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.displayMessage('error', 'Please select a valid image file (JPG, PNG, GIF, etc.).');
        return;
      }

      // Validate file size (max 5MB before compression)
      if (file.size > 5 * 1024 * 1024) {
        this.displayMessage('error', 'Image file size must be less than 5MB. Please choose a smaller image.');
        return;
      }

      this.selectedFile = file;
      this.compressImage(file);
    }
  }

  compressImage(file: File): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 600;

        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);

        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        this.photoPreview = compressedBase64;
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  removePhoto(): void {
    this.selectedFile = null;
    this.photoPreview = null;
    this.facilityForm.imageUrl = '';
  }

  saveAddEdit(): void {
    // Trim all text fields
    const trimmedName = this.facilityForm.name.trim();
    const trimmedBuilding = this.facilityForm.building.trim();
    const trimmedDescription = this.facilityForm.description.trim();

    // Validate required fields
    if (!trimmedName) {
      this.displayMessage('error', 'Facility name is required. Please enter a name for this facility.');
      return;
    }

    if (!trimmedBuilding) {
      this.displayMessage('error', 'Building name is required. Please specify which building this facility is in.');
      return;
    }

    if (this.facilityForm.capacity <= 0) {
      this.displayMessage('error', 'Capacity must be greater than 0. Please enter a valid capacity.');
      return;
    }

    // Check for duplicate names (frontend validation)
    const duplicateName = this.facilities.find(f =>
      f.name.toLowerCase().trim() === trimmedName.toLowerCase() &&
      f.id !== this.facilityForm.id
    );

    if (duplicateName) {
      this.displayMessage(
        'error',
        `A facility named "${trimmedName}" already exists. Please choose a different name.`
      );
      return;
    }

    // Use preview URL if file was selected
    if (this.photoPreview && !this.facilityForm.imageUrl) {
      this.facilityForm.imageUrl = this.photoPreview;
    }

    const requestData = {
      name: trimmedName,
      type: this.facilityForm.type,
      building: trimmedBuilding,
      floor: this.facilityForm.floor,
      capacity: this.facilityForm.capacity,
      description: trimmedDescription,
      imageUrl: this.facilityForm.imageUrl,
      status: this.facilityForm.status
    };

    if (this.isEditMode && this.facilityForm.id) {
      // Update existing facility
      this.facilityService.updateFacility(this.facilityForm.id, requestData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadFacilities();
            this.closeAddEditModal();
            this.displayMessage('success', `Facility "${trimmedName}" has been updated successfully!`);
          },
          error: (error) => {
            console.error('Error updating facility:', error);
            const errorMessage = this.parseUpdateError(error, trimmedName);
            this.displayMessage('error', errorMessage);
          }
        });
    } else {
      // Add new facility
      this.facilityService.createFacility(requestData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadFacilities();
            this.closeAddEditModal();
            this.displayMessage('success', `Facility "${trimmedName}" has been created successfully!`);
          },
          error: (error) => {
            console.error('Error creating facility:', error);
            const errorMessage = this.parseUpdateError(error, trimmedName);
            this.displayMessage('error', errorMessage);
          }
        });
    }
  }

  private parseUpdateError(error: any, facilityName: string): string {
    console.error('Update error details:', error);

    // Try to extract error message from various formats
    let errorMessage = this.extractErrorMessage(error);

    if (errorMessage) {
      const lowerError = errorMessage.toLowerCase();

      // Check for specific error patterns
      if (lowerError.includes('duplicate') || lowerError.includes('already exists') || lowerError.includes('unique constraint')) {
        return `A facility named "${facilityName}" already exists in the system. Please choose a different name.`;
      }

      if (lowerError.includes('capacity') && lowerError.includes('reservation')) {
        return `Cannot reduce capacity: This facility has active reservations that require the current capacity. ` +
          'Please cancel or modify reservations first, or increase the capacity.';
      }

      if (lowerError.includes('capacity') && lowerError.includes('reduce')) {
        return `Cannot reduce capacity below the number of reserved seats. ` +
          'Please ensure all reservations can accommodate the new capacity.';
      }

      if (lowerError.includes('reserved') || lowerError.includes('reservation')) {
        return `Cannot modify this facility because it has active reservations. ` +
          'Please wait for reservations to complete or cancel them first.';
      }

      if (lowerError.includes('invalid') && lowerError.includes('capacity')) {
        return 'The capacity value is invalid. Please enter a positive number.';
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
      return `Cannot save changes to "${facilityName}" due to a conflict. ` +
        'This facility may have active reservations that prevent modifications. ' +
        'Please check the facility status and try again.';
    }

    if (error.status === 422) {
      return 'The data provided cannot be processed. Please verify all fields are correct.';
    }

    if (error.status === 500) {
      return 'A server error occurred while saving the facility. Please try again or contact support if the problem persists.';
    }

    // Default error message
    return `Failed to save facility "${facilityName}". Please verify all information is correct and try again. ` +
      'If the problem persists, contact support for assistance.';
  }

  confirmDelete(): void {
    if (this.selectedFacility) {
      const facilityName = this.selectedFacility.name;

      this.facilityService.deleteFacility(this.selectedFacility.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadFacilities();
            this.closeDeleteModal();
            this.displayMessage('success', `Facility "${facilityName}" has been deleted successfully.`);
          },
          error: (error) => {
            console.error('Error deleting facility:', error);
            const errorMessage = this.parseDeleteError(error, facilityName);
            this.closeDeleteModal(); // Close modal even on error
            this.displayMessage('error', errorMessage);
          }
        });
    }
  }

  private parseDeleteError(error: any, facilityName: string): string {
    console.error('Delete error details:', error);

    // Try to extract error message from various formats
    let errorMessage = this.extractErrorMessage(error);

    if (errorMessage) {
      const lowerError = errorMessage.toLowerCase();

      // Check for specific error patterns
      if (lowerError.includes('reserved') || lowerError.includes('reservation')) {
        return `Cannot delete "${facilityName}" because it has active or upcoming reservations. ` +
          'Please cancel all reservations before attempting to delete this facility.';
      }

      if (lowerError.includes('in use') || lowerError.includes('active')) {
        return `Cannot delete "${facilityName}" because it is currently in use. ` +
          'Please ensure the facility is not actively being used and try again.';
      }

      if (lowerError.includes('booked') || lowerError.includes('booking')) {
        return `Cannot delete "${facilityName}" because it has active bookings. ` +
          'Please cancel or complete all bookings before deleting.';
      }

      if (lowerError.includes('foreign key') || lowerError.includes('constraint') || lowerError.includes('reference')) {
        return `Cannot delete "${facilityName}" because it has related records (such as reservations, bookings, or history). ` +
          'Please remove all related records first or contact support for assistance.';
      }

      if (lowerError.includes('dependency') || lowerError.includes('dependent')) {
        return `Cannot delete "${facilityName}" because other records depend on it. ` +
          'Please remove dependent records first.';
      }

      // Return server message if it's descriptive and reasonable length
      if (errorMessage.length >= 15 && errorMessage.length <= 200) {
        return errorMessage;
      }
    }

    // Status code based messages
    if (error.status === 409) {
      return `Cannot delete "${facilityName}" because it has active reservations or dependencies. ` +
        'Please ensure all reservations are cancelled and no other records reference this facility.';
    }

    if (error.status === 400) {
      return `Cannot delete "${facilityName}". This facility may be in use or have active reservations. ` +
        'Please check the facility status and try again.';
    }

    if (error.status === 500) {
      return `Cannot delete "${facilityName}" due to a server error. ` +
        'This facility likely has related reservations or bookings that must be removed first. ' +
        'Please contact support if you need assistance.';
    }

    // Default error message
    return `Failed to delete "${facilityName}". This facility may have active reservations or dependencies. ` +
      'Please ensure all reservations are cancelled and try again. If the problem persists, contact support.';
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
    this.selectedFacility = null;
    this.isEditMode = false;
    this.selectedFile = null;
    this.photoPreview = null;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.selectedFacility = null;
  }

  isFormValid(): boolean {
    return !!(
      this.facilityForm.name.trim() &&
      this.facilityForm.building.trim() &&
      this.facilityForm.capacity > 0
    );
  }

  get filteredFacilities(): Facility[] {
    // Create a new array to avoid reference issues
    let filtered = [...this.facilities];

    // Filter by search text
    if (this.searchText.trim()) {
      const query = this.searchText.toLowerCase();
      filtered = filtered.filter(facility =>
        facility.name.toLowerCase().includes(query) ||
        facility.building.toLowerCase().includes(query) ||
        facility.id.toString().toLowerCase().includes(query) ||
        this.formatFacilityId(facility.id).toLowerCase().includes(query)
      );
    }

    // Filter by status
    if (this.selectedStatus !== 'All Status') {
      const statusMap: Record<string, string> = {
        'Available': 'AVAILABLE',
        'Reserved': 'RESERVED',
        'Unavailable': 'UNAVAILABLE'
      };
      const status = statusMap[this.selectedStatus];
      if (status) {
        filtered = filtered.filter(facility => facility.status === status);
      }
    }

    // Remove any duplicates (just in case)
    return filtered.filter((facility, index, self) =>
      index === self.findIndex(f => f.id === facility.id)
    );
  }
}