import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface EquipmentItem {
  id: string;
  name: string;
  category: string;
  condition: string;
  availability: 'available' | 'borrowed';
  description?: string;
  borrowedBy?: string;
  dueDate?: string;
  photoUrl?: string;
}

@Component({
  selector: 'app-equipment',
  templateUrl: './equipment.html',
  styleUrls: ['./equipment.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class Equipment {
  searchText: string = '';
  showAddEditModal: boolean = false;
  showDeleteModal: boolean = false;
  isEditMode: boolean = false;
  selectedEquipment: EquipmentItem | null = null;
  selectedFile: File | null = null;
  photoPreview: string | null = null;

  // Form fields
  equipmentForm = {
    id: '',
    name: '',
    category: 'AUDIO',
    condition: 'Good',
    availability: 'available' as 'available' | 'borrowed',
    description: '',
    photoUrl: ''
  };

  equipment: EquipmentItem[] = [
    {
      id: 'E001',
      name: 'Projector',
      category: 'Facilites',
      condition: 'Good',
      availability: 'available',
      description: ''
    },
    {
      id: 'E002',
      name: 'Speaker',
      category: 'Equipments',
      condition: 'Good',
      availability: 'borrowed',
      description: '',
      borrowedBy: 'Kevin Barcelos',
      dueDate: 'Jan 3, 2025'
    }
  ];

  // Search and filters
  selectedCategory: string = 'All Categories';
  selectedCondition: string = 'All Conditions';
  selectedAvailability: string = 'All Availability';

  getStatusText(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  addNewEquipment(): void {
    this.isEditMode = false;
    this.equipmentForm = {
      id: '',
      name: '',
      category: 'AUDIO',
      condition: 'Good',
      availability: 'available',
      description: '',
      photoUrl: ''
    };
    this.selectedFile = null;
    this.photoPreview = null;
    this.showAddEditModal = true;
  }

  editEquipment(item: EquipmentItem): void {
    this.isEditMode = true;
    this.selectedEquipment = item;
    this.equipmentForm = {
      id: item.id,
      name: item.name,
      category: item.category,
      condition: item.condition,
      availability: item.availability,
      description: item.description || '',
      photoUrl: item.photoUrl || ''
    };
    this.selectedFile = null;
    this.photoPreview = item.photoUrl || null;
    this.showAddEditModal = true;
  }

  deleteEquipment(item: EquipmentItem): void {
    this.selectedEquipment = item;
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
    this.equipmentForm.photoUrl = '';
  }

  saveAddEdit(): void {
    // In a real application, you would upload the file to a server here
    // For now, we'll store the preview URL
    if (this.photoPreview && !this.equipmentForm.photoUrl) {
      this.equipmentForm.photoUrl = this.photoPreview;
    }

    if (this.isEditMode && this.selectedEquipment) {
      // Update existing equipment
      const index = this.equipment.findIndex(e => e.id === this.selectedEquipment!.id);
      if (index !== -1) {
        this.equipment[index] = {
          ...this.equipment[index],
          ...this.equipmentForm
        };
      }
      console.log('Updated equipment:', this.equipmentForm);
    } else {
      // Add new equipment
      const newEquipment: EquipmentItem = {
        ...this.equipmentForm,
        id: 'E' + String(this.equipment.length + 1).padStart(3, '0')
      };
      this.equipment.push(newEquipment);
      console.log('Added new equipment:', newEquipment);
    }
    this.closeAddEditModal();
  }

  confirmDelete(): void {
    if (this.selectedEquipment) {
      const index = this.equipment.findIndex(e => e.id === this.selectedEquipment!.id);
      if (index !== -1) {
        this.equipment.splice(index, 1);
      }
      console.log('Deleted equipment:', this.selectedEquipment);
    }
    this.closeDeleteModal();
  }

  closeAddEditModal(): void {
    this.showAddEditModal = false;
    this.selectedEquipment = null;
    this.isEditMode = false;
    this.selectedFile = null;
    this.photoPreview = null;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.selectedEquipment = null;
  }

  isFormValid(): boolean {
    return !!(this.equipmentForm.name.trim());
  }

  get filteredEquipment(): EquipmentItem[] {
    let filtered = this.equipment;

    // Filter by search text
    if (this.searchText.trim()) {
      const query = this.searchText.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.id.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (this.selectedCategory !== 'All Categories') {
      filtered = filtered.filter(item =>
        item.category?.toUpperCase() === this.selectedCategory.toUpperCase()
      );
    }

    // Filter by condition
    if (this.selectedCondition !== 'All Conditions') {
      filtered = filtered.filter(item => item.condition === this.selectedCondition);
    }

    // Filter by availability
    if (this.selectedAvailability !== 'All Availability') {
      filtered = filtered.filter(item =>
        this.selectedAvailability === 'Available' ? item.availability === 'available' : item.availability === 'borrowed'
      );
    }

    return filtered;
  }
}