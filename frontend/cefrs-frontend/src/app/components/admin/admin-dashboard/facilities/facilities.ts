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
          this.displayMessage('error', 'Failed to load facilities');
        }
      });
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

  deleteFacility(facility: Facility): void {
    this.selectedFacility = facility;
    this.showDeleteModal = true;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.displayMessage('error', 'Please select an image file');
        return;
      }

      // Validate file size (max 5MB before compression)
      if (file.size > 5 * 1024 * 1024) {
        this.displayMessage('error', 'File size must be less than 5MB.');
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
    // Use preview URL if file was selected
    if (this.photoPreview && !this.facilityForm.imageUrl) {
      this.facilityForm.imageUrl = this.photoPreview;
    }

    const requestData = {
      name: this.facilityForm.name,
      type: this.facilityForm.type,
      building: this.facilityForm.building,
      floor: this.facilityForm.floor,
      capacity: this.facilityForm.capacity,
      description: this.facilityForm.description,
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
            this.displayMessage('success', 'Facility updated successfully!');
          },
          error: (error) => {
            console.error('Error updating facility:', error);
            this.displayMessage('error', 'Failed to update facility');
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
            this.displayMessage('success', 'Facility created successfully!');
          },
          error: (error) => {
            console.error('Error creating facility:', error);
            this.displayMessage('error', 'Failed to create facility');
          }
        });
    }
  }

  confirmDelete(): void {
    if (this.selectedFacility) {
      this.facilityService.deleteFacility(this.selectedFacility.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadFacilities();
            this.closeDeleteModal();
            this.displayMessage('success', 'Facility deleted successfully!');
          },
          error: (error) => {
            console.error('Error deleting facility:', error);
            this.displayMessage('error', 'Failed to delete facility');
          }
        });
    }
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
        facility.id.toString().toLowerCase().includes(query)
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