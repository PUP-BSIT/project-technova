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
          console.log('Facilities loaded:', this.facilities);
        },
        error: (error) => {
          console.error('Error loading facilities:', error);
          this.isLoading = false;
          alert('Failed to load facilities');
        }
      });
  }

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'AVAILABLE': 'Available',
      'UNDER_MAINTENANCE': 'Under Maintenance',
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
        alert('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      this.selectedFile = file;

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.photoPreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
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

    if (this.isEditMode && this.facilityForm.id) {
      // Update existing facility
      this.facilityService.updateFacility(this.facilityForm.id, this.facilityForm)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadFacilities();
            this.closeAddEditModal();
            alert('Facility updated successfully!');
          },
          error: (error) => {
            console.error('Error updating facility:', error);
            alert('Failed to update facility');
          }
        });
    } else {
      // Add new facility
      this.facilityService.createFacility(this.facilityForm)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadFacilities();
            this.closeAddEditModal();
            alert('Facility created successfully!');
          },
          error: (error) => {
            console.error('Error creating facility:', error);
            alert('Failed to create facility');
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
            alert('Facility deleted successfully!');
          },
          error: (error) => {
            console.error('Error deleting facility:', error);
            alert('Failed to delete facility');
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
    let filtered = this.facilities;

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
        'Under Maintenance': 'UNDER_MAINTENANCE',
        'Unavailable': 'UNAVAILABLE'
      };
      const status = statusMap[this.selectedStatus];
      if (status) {
        filtered = filtered.filter(facility => facility.status === status);
      }
    }

    return filtered;
  }
}