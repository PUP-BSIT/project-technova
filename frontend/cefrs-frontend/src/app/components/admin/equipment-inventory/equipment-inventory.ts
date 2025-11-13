import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { EquipmentService, EquipmentDTO } from '../../../services/equipment.service';

interface EquipmentInventoryItem {
  id: number;
  name: string;
  code: string; // SKU/Code
  category: string;
  quantityTotal: number;
  quantityAvailable: number;
  quantityBorrowed: number;
  description: string;
  imageUrl?: string;
  status: string;
  condition: string;
  lastModified: Date;
  selected: boolean;
  editing: boolean;
  tempQuantity?: number;
}

@Component({
  selector: 'app-equipment-inventory',
  templateUrl: './equipment-inventory.html',
  styleUrls: ['./equipment-inventory.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class EquipmentInventory implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Data
  equipment: EquipmentInventoryItem[] = [];
  filteredEquipment: EquipmentInventoryItem[] = [];

  // Filters
  searchQuery: string = '';
  selectedCategory: string = 'All products';
  selectedStock: string = 'Any stock';

  // Selection
  selectedItems: Set<number> = new Set();
  selectAll: boolean = false;

  // Bulk update
  bulkQuantity: number = 0;

  // Loading
  isLoading: boolean = false;

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
            code: `EQ-${e.id}`, // Generate code
            category: e.category,
            quantityTotal: e.quantityTotal,
            quantityAvailable: e.quantityAvailable,
            quantityBorrowed: e.quantityTotal - e.quantityAvailable,
            description: e.description,
            imageUrl: e.imageUrl,
            status: e.status,
            condition: this.getConditionFromQuantity(e.quantityAvailable, e.quantityTotal),
            lastModified: new Date(),
            selected: false,
            editing: false
          }));
          this.applyFilters();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading equipment:', error);
          this.isLoading = false;
          alert('Failed to load equipment');
        }
      });
  }

  getConditionFromQuantity(available: number, total: number): string {
    const percentAvailable = (available / total) * 100;
    if (percentAvailable === 100) return 'Good';
    if (percentAvailable >= 50) return 'Fair';
    if (percentAvailable > 0) return 'Low Stock';
    return 'Out of Stock';
  }

  applyFilters(): void {
    let filtered = [...this.equipment];

    // Search filter
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.code.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (this.selectedCategory !== 'All products') {
      filtered = filtered.filter(item => item.category === this.selectedCategory);
    }

    // Stock filter
    if (this.selectedStock !== 'Any stock') {
      if (this.selectedStock === 'In stock') {
        filtered = filtered.filter(item => item.quantityAvailable > 0);
      } else if (this.selectedStock === 'Out of stock') {
        filtered = filtered.filter(item => item.quantityAvailable === 0);
      } else if (this.selectedStock === 'Low stock') {
        filtered = filtered.filter(item => {
          const percent = (item.quantityAvailable / item.quantityTotal) * 100;
          return percent > 0 && percent < 50;
        });
      }
    }

    this.filteredEquipment = filtered;
  }

  // Selection methods
  toggleSelectAll(): void {
    this.selectAll = !this.selectAll;
    this.filteredEquipment.forEach(item => {
      item.selected = this.selectAll;
      if (this.selectAll) {
        this.selectedItems.add(item.id);
      } else {
        this.selectedItems.delete(item.id);
      }
    });
  }

  toggleSelect(item: EquipmentInventoryItem): void {
    item.selected = !item.selected;
    if (item.selected) {
      this.selectedItems.add(item.id);
    } else {
      this.selectedItems.delete(item.id);
    }
    this.updateSelectAllState();
  }

  updateSelectAllState(): void {
    const allSelected = this.filteredEquipment.length > 0 &&
      this.filteredEquipment.every(item => item.selected);
    this.selectAll = allSelected;
  }

  // Edit methods
  startEdit(item: EquipmentInventoryItem): void {
    item.editing = true;
    item.tempQuantity = item.quantityTotal;
  }

  cancelEdit(item: EquipmentInventoryItem): void {
    item.editing = false;
    item.tempQuantity = undefined;
  }

  saveQuantity(item: EquipmentInventoryItem): void {
    if (item.tempQuantity === undefined || item.tempQuantity < 0) {
      alert('Please enter a valid quantity');
      return;
    }

    const requestData = {
      name: item.name,
      category: item.category,
      quantityTotal: item.tempQuantity,
      description: item.description,
      imageUrl: item.imageUrl || '',
      status: item.status
    };

    this.equipmentService.updateEquipment(item.id, requestData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          item.quantityTotal = item.tempQuantity!;
          item.editing = false;
          item.tempQuantity = undefined;
          item.condition = this.getConditionFromQuantity(item.quantityAvailable, item.quantityTotal);
          alert('Quantity updated successfully!');
        },
        error: (error) => {
          console.error('Error updating quantity:', error);
          alert('Failed to update quantity');
        }
      });
  }

  // Bulk update
  updateBulkQuantity(): void {
    if (this.selectedItems.size === 0) {
      alert('Please select items to update');
      return;
    }

    if (!confirm(`Update ${this.selectedItems.size} items to quantity ${this.bulkQuantity}?`)) {
      return;
    }

    const updates = Array.from(this.selectedItems).map(id => {
      const item = this.equipment.find(e => e.id === id);
      if (!item) return null;

      return this.equipmentService.updateEquipment(id, {
        name: item.name,
        category: item.category,
        quantityTotal: this.bulkQuantity,
        description: item.description,
        imageUrl: item.imageUrl || '',
        status: item.status
      });
    }).filter(Boolean);

    // Execute all updates (simplified - should use forkJoin in production)
    Promise.all(updates.map(u => u?.toPromise()))
      .then(() => {
        alert('Bulk update completed!');
        this.loadEquipment();
        this.selectedItems.clear();
        this.selectAll = false;
        this.bulkQuantity = 0;
      })
      .catch(error => {
        console.error('Bulk update error:', error);
        alert('Some updates failed. Please try again.');
      });
  }

  // Export to CSV
  exportToCSV(): void {
    const headers = ['Code', 'Product', 'Category', 'Stock', 'Available', 'Borrowed', 'Status', 'Condition'];
    const rows = this.filteredEquipment.map(item => [
      item.code,
      item.name,
      item.category,
      item.quantityTotal,
      item.quantityAvailable,
      item.quantityBorrowed,
      item.status,
      item.condition
    ]);

    let csvContent = headers.join(',') + '\n';
    rows.forEach(row => {
      csvContent += row.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `equipment-inventory-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  }

  // Category badge color
  getCategoryBadgeClass(category: string): string {
    const colorMap: Record<string, string> = {
      'AUDIO': 'badge-audio',
      'VIDEO': 'badge-video',
      'COMPUTER': 'badge-computer',
      'PROJECTOR': 'badge-projector',
      'MICROPHONE': 'badge-microphone',
      'SPEAKER': 'badge-speaker',
      'OTHER': 'badge-other'
    };
    return colorMap[category] || 'badge-default';
  }

  // Get unique categories
  get categories(): string[] {
    return ['All products', ...new Set(this.equipment.map(e => e.category))];
  }
}