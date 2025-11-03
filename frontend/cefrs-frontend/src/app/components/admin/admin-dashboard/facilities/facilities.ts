import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Facility {
  id: string;
  name: string;
  location: string;
  capacity: number;
  description: string;
  status: 'available' | 'maintenance' | 'unavailable';
}

@Component({
  selector: 'app-facilities',
  templateUrl: './facilities.html',
  styleUrls: ['./facilities.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class Facilities {
  searchText: string = '';
  showAddEditModal: boolean = false;
  showDeleteModal: boolean = false;
  isEditMode: boolean = false;
  selectedFacility: Facility | null = null;

  // Form fields
  facilityForm = {
    id: '',
    name: '',
    location: '',
    capacity: 0,
    description: '',
    status: 'available' as 'available' | 'maintenance' | 'unavailable'
  };

  facilities: Facility[] = [
    {
      id: 'R1023',
      name: 'Aboitiz',
      location: 'Building A',
      capacity: 40,
      description: 'Suitable for classes',
      status: 'available'
    },
    {
      id: 'R1024',
      name: 'Computer Lab 2',
      location: 'Building A',
      capacity: 45,
      description: 'Suitable for classes',
      status: 'maintenance'
    },
    {
      id: 'R1025',
      name: 'Conference Room',
      location: 'Building A',
      capacity: 45,
      description: '',
      status: 'unavailable'
    }
  ];

  getStatusText(status: string): string {
    if (status === 'maintenance') {
      return 'Under Maintenance';
    }
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  addNewFacility(): void {
    this.isEditMode = false;
    this.facilityForm = {
      id: '',
      name: '',
      location: '',
      capacity: 0,
      description: '',
      status: 'available'
    };
    this.showAddEditModal = true;
  }

  editFacility(facility: Facility): void {
    this.isEditMode = true;
    this.selectedFacility = facility;
    this.facilityForm = {
      id: facility.id,
      name: facility.name,
      location: facility.location,
      capacity: facility.capacity,
      description: facility.description,
      status: facility.status
    };
    this.showAddEditModal = true;
  }

  deleteFacility(facility: Facility): void {
    this.selectedFacility = facility;
    this.showDeleteModal = true;
  }

  saveAddEdit(): void {
    if (this.isEditMode && this.selectedFacility) {
      // Update existing facility
      const index = this.facilities.findIndex(f => f.id === this.selectedFacility!.id);
      if (index !== -1) {
        this.facilities[index] = { ...this.facilityForm };
      }
      console.log('Updated facility:', this.facilityForm);
    } else {
      // Add new facility
      const newFacility: Facility = {
        ...this.facilityForm,
        id: 'R' + (1025 + this.facilities.length + 1) // Generate new ID
      };
      this.facilities.push(newFacility);
      console.log('Added new facility:', newFacility);
    }
    this.closeAddEditModal();
  }

  confirmDelete(): void {
    if (this.selectedFacility) {
      const index = this.facilities.findIndex(f => f.id === this.selectedFacility!.id);
      if (index !== -1) {
        this.facilities.splice(index, 1);
      }
      console.log('Deleted facility:', this.selectedFacility);
    }
    this.closeDeleteModal();
  }

  closeAddEditModal(): void {
    this.showAddEditModal = false;
    this.selectedFacility = null;
    this.isEditMode = false;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.selectedFacility = null;
  }

  isFormValid(): boolean {
    return !!(
      this.facilityForm.name.trim() &&
      this.facilityForm.location.trim() &&
      this.facilityForm.capacity > 0
    );
  }
}