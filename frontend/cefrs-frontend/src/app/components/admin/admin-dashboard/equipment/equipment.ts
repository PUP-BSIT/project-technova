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

  // Form fields
  equipmentForm = {
    id: '',
    name: '',
    category: 'Multimedia',
    condition: 'Good',
    availability: 'available' as 'available' | 'borrowed',
    description: ''
  };

  equipment: EquipmentItem[] = [
    {
      id: 'E001',
      name: 'Projector',
      category: 'Multimedia',
      condition: 'Good',
      availability: 'available',
      description: ''
    },
    {
      id: 'E002',
      name: 'Speaker',
      category: 'Audio',
      condition: 'Good',
      availability: 'borrowed',
      description: '',
      borrowedBy: 'Kevin Barcelos',
      dueDate: 'Jan 3, 2025'
    }
  ];

  getStatusText(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  addNewEquipment(): void {
    this.isEditMode = false;
    this.equipmentForm = {
      id: '',
      name: '',
      category: 'Multimedia',
      condition: 'Good',
      availability: 'available',
      description: ''
    };
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
      description: item.description || ''
    };
    this.showAddEditModal = true;
  }

  deleteEquipment(item: EquipmentItem): void {
    this.selectedEquipment = item;
    this.showDeleteModal = true;
  }

  saveAddEdit(): void {
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
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.selectedEquipment = null;
  }

  isFormValid(): boolean {
    return !!(this.equipmentForm.name.trim());
  }
}