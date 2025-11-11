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
  isEditMode: boolean = false;
  selectedEquipment: EquipmentItem | null = null;
  selectedFile: File | null = null;
  photoPreview: string | null = null;
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

  ngOnInit(): void {
    this.loadEquipment();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
          console.log('Equipment loaded:', this.equipment);
        },
        error: (error) => {
          console.error('Error loading equipment:', error);
          this.isLoading = false;
          alert('Failed to load equipment');
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
    // Show based on actual database status
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
      quantityTotal: item.quantityTotal,
      description: item.description || '',
      imageUrl: item.imageUrl || '',
      status: item.status
    };
    this.selectedFile = null;
    this.photoPreview = item.imageUrl || null;
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
    this.equipmentForm.imageUrl = '';
  }

  saveAddEdit(): void {
    // Use preview URL if file was selected
    if (this.photoPreview && !this.equipmentForm.imageUrl) {
      this.equipmentForm.imageUrl = this.photoPreview;
    }

    const requestData: EquipmentRequestDTO = {
      name: this.equipmentForm.name,
      category: this.equipmentForm.category,
      quantityTotal: this.equipmentForm.quantityTotal,
      description: this.equipmentForm.description,
      imageUrl: this.equipmentForm.imageUrl,
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
            alert('Equipment updated successfully!');
          },
          error: (error) => {
            console.error('Error updating equipment:', error);
            alert('Failed to update equipment');
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
            alert('Equipment created successfully!');
          },
          error: (error) => {
            console.error('Error creating equipment:', error);
            alert('Failed to create equipment');
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
            alert('Equipment deleted successfully!');
          },
          error: (error) => {
            console.error('Error deleting equipment:', error);
            alert('Failed to delete equipment');
          }
        });
    }
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
    return !!(
      this.equipmentForm.name.trim() &&
      this.equipmentForm.quantityTotal > 0
    );
  }

  get filteredEquipment(): EquipmentItem[] {
    let filtered = this.equipment;

    // Filter by search text
    if (this.searchText.trim()) {
      const query = this.searchText.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.id.toString().toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (this.selectedCategory !== 'All Categories') {
      filtered = filtered.filter(item =>
        item.category === this.selectedCategory
      );
    }

    // Filter by condition (based on quantity available)
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

    return filtered;
  }
}