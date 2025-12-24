import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { EquipmentService, EquipmentDTO } from '../../../services/equipment.service';

interface EquipmentInventoryItem {
  id: number;
  name: string;
  code: string;
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
  location?: string;
  reorderPoint?: number;
  supplier?: string;
  lastAuditDate?: Date;
  needsAttention?: boolean;
}

interface StockAdjustment {
  equipmentId: number;
  quantityChange: number;
  reason: string;
  notes: string;
  date: Date;
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

  // View mode
  viewMode: 'table' | 'audit' | 'reorder' = 'table';

  // Filters
  searchQuery: string = '';
  selectedCategory: string = 'All products';
  selectedStock: string = 'Any stock';
  selectedLocation: string = 'All locations';

  // Selection
  selectedItems: Set<number> = new Set();
  selectAll: boolean = false;

  // Bulk adjustment
  bulkAdjustmentReason: string = '';
  bulkAdjustmentQuantity: number = 0;
  bulkAdjustmentNotes: string = '';

  // Stock adjustment modal
  showAdjustmentModal: boolean = false;
  selectedEquipment: EquipmentInventoryItem | null = null;
  adjustmentType: 'add' | 'remove' | 'set' = 'set';
  adjustmentQuantity: number = 0;
  adjustmentReason: string = 'stock_count';
  adjustmentNotes: string = '';

  // Audit mode
  auditItems: Map<number, number> = new Map();
  auditMode: boolean = false;

  // Location modal
  showLocationModal: boolean = false;
  newLocation: string = '';

  // Loading
  isLoading: boolean = false;

  // Message Modal
  showMessageModal: boolean = false;
  messageType: 'success' | 'error' = 'success';
  messageText: string = '';

  // Confirmation Modal
  showConfirmModal: boolean = false;
  confirmMessage: string = '';
  confirmCallback: (() => void) | null = null;

  // Predefined reasons
  adjustmentReasons = [
    { value: 'stock_count', label: 'Stock Count/Audit' },
    { value: 'new_purchase', label: 'New Purchase' },
    { value: 'damaged', label: 'Damaged/Broken' },
    { value: 'lost', label: 'Lost/Stolen' },
    { value: 'found', label: 'Found During Audit' },
    { value: 'donated', label: 'Donated' },
    { value: 'retired', label: 'Retired/Disposed' },
    { value: 'maintenance', label: 'Under Maintenance' },
    { value: 'correction', label: 'Correction/Error Fix' },
    { value: 'other', label: 'Other' }
  ];

  // Locations
  locations = ['All locations', 'Storage Room A', 'Storage Room B', 'Tech Lab', 'Admin Office', 'Warehouse', 'Maintenance Area'];

  constructor(private equipmentService: EquipmentService) { }

  ngOnInit(): void {
    this.loadEquipment();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private displayMessage(type: 'success' | 'error', message: string): void {
    this.messageType = type;
    this.messageText = message;
    this.showMessageModal = true;
  }

  closeMessageModal(): void {
    this.showMessageModal = false;
  }

  private showConfirm(message: string, callback: () => void): void {
    this.confirmMessage = message;
    this.confirmCallback = callback;
    this.showConfirmModal = true;
  }

  confirmAction(): void {
    if (this.confirmCallback) {
      this.confirmCallback();
    }
    this.closeConfirmModal();
  }

  closeConfirmModal(): void {
    this.showConfirmModal = false;
    this.confirmMessage = '';
    this.confirmCallback = null;
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
            code: `EQ-${e.id.toString().padStart(4, '0')}`,
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
            editing: false,
            location: this.getRandomLocation(),
            reorderPoint: Math.floor(e.quantityTotal * 0.3),
            supplier: this.getRandomSupplier(),
            lastAuditDate: this.getRandomDate(),
            needsAttention: e.quantityAvailable <= Math.floor(e.quantityTotal * 0.3)
          }));
          this.applyFilters();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading equipment:', error);
          this.isLoading = false;
          this.displayMessage('error', 'Failed to load equipment');
        }
      });
  }

  // Helper methods for demo data
  private getRandomLocation(): string {
    const locs = ['Storage Room A', 'Storage Room B', 'Tech Lab', 'Admin Office', 'Warehouse'];
    return locs[Math.floor(Math.random() * locs.length)];
  }

  private getRandomSupplier(): string {
    const suppliers = ['TechSupply Co.', 'EquipMart', 'ProAudio Solutions', 'Global Tech Distributors'];
    return suppliers[Math.floor(Math.random() * suppliers.length)];
  }

  private getRandomDate(): Date {
    const days = Math.floor(Math.random() * 90);
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date;
  }

  getConditionFromQuantity(available: number, total: number): string {
    const percentAvailable = (available / total) * 100;
    if (percentAvailable === 100) return 'Excellent';
    if (percentAvailable >= 75) return 'Good';
    if (percentAvailable >= 50) return 'Fair';
    if (percentAvailable > 0) return 'Low Stock';
    return 'Out of Stock';
  }

  applyFilters(): void {
    let filtered = [...this.equipment];

    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.code.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
      );
    }

    if (this.selectedCategory !== 'All products') {
      filtered = filtered.filter(item => item.category === this.selectedCategory);
    }

    if (this.selectedStock !== 'Any stock') {
      if (this.selectedStock === 'In stock') {
        filtered = filtered.filter(item => item.quantityAvailable > 0);
      } else if (this.selectedStock === 'Out of stock') {
        filtered = filtered.filter(item => item.quantityAvailable === 0);
      } else if (this.selectedStock === 'Low stock') {
        filtered = filtered.filter(item => item.needsAttention);
      } else if (this.selectedStock === 'Needs reorder') {
        filtered = filtered.filter(item => item.quantityAvailable <= (item.reorderPoint || 0));
      }
    }

    if (this.selectedLocation !== 'All locations') {
      filtered = filtered.filter(item => item.location === this.selectedLocation);
    }

    this.filteredEquipment = filtered;
  }

  // View mode switching
  switchView(mode: 'table' | 'audit' | 'reorder'): void {
    this.viewMode = mode;
    if (mode === 'audit') {
      this.startAuditMode();
    } else if (mode === 'reorder') {
      this.applyFilters();
    }
  }

  // Audit mode
  startAuditMode(): void {
    this.auditMode = true;
    this.auditItems.clear();
    this.filteredEquipment.forEach(item => {
      this.auditItems.set(item.id, item.quantityTotal);
    });
  }

  updateAuditCount(itemId: number, count: number): void {
    this.auditItems.set(itemId, count);
  }

  completeAudit(): void {
    this.showConfirm(
      'Complete audit and apply adjustments? This will update all stock quantities based on your counts.',
      () => this.executeAuditCompletion()
    );
  }

  private executeAuditCompletion(): void {
    const adjustments: Promise<any>[] = [];

    this.auditItems.forEach((count, id) => {
      const item = this.equipment.find(e => e.id === id);
      if (item && count !== item.quantityTotal) {
        const requestData = {
          name: item.name,
          category: item.category,
          quantityTotal: count,
          description: item.description,
          imageUrl: item.imageUrl || '',
          status: item.status
        };
        adjustments.push(
          this.equipmentService.updateEquipment(id, requestData).toPromise()
        );
      }
    });

    if (adjustments.length === 0) {
      this.displayMessage('success', 'No changes detected in audit');
      this.auditMode = false;
      this.viewMode = 'table';
      return;
    }

    Promise.all(adjustments)
      .then(() => {
        this.displayMessage('success', `Audit completed! ${adjustments.length} items updated.`);
        this.auditMode = false;
        this.viewMode = 'table';
        this.loadEquipment();
      })
      .catch(error => {
        console.error('Audit completion error:', error);
        this.displayMessage('error', 'Some adjustments failed. Please try again.');
      });
  }

  cancelAudit(): void {
    this.auditMode = false;
    this.auditItems.clear();
    this.viewMode = 'table';
  }

  // Stock adjustment
  openAdjustmentModal(item: EquipmentInventoryItem): void {
    this.selectedEquipment = item;
    this.adjustmentType = 'set';
    this.adjustmentQuantity = item.quantityTotal;
    this.adjustmentReason = 'stock_count';
    this.adjustmentNotes = '';
    this.showAdjustmentModal = true;
  }

  closeAdjustmentModal(): void {
    this.showAdjustmentModal = false;
    this.selectedEquipment = null;
  }

  submitAdjustment(): void {
    if (!this.selectedEquipment) return;

    let newQuantity = this.adjustmentQuantity;

    if (this.adjustmentType === 'add') {
      newQuantity = this.selectedEquipment.quantityTotal + this.adjustmentQuantity;
    } else if (this.adjustmentType === 'remove') {
      newQuantity = this.selectedEquipment.quantityTotal - this.adjustmentQuantity;
    }

    if (newQuantity < 0) {
      this.displayMessage('error', 'Quantity cannot be negative');
      return;
    }

    const requestData = {
      name: this.selectedEquipment.name,
      category: this.selectedEquipment.category,
      quantityTotal: newQuantity,
      description: this.selectedEquipment.description,
      imageUrl: this.selectedEquipment.imageUrl || '',
      status: this.selectedEquipment.status
    };

    this.equipmentService.updateEquipment(this.selectedEquipment.id, requestData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.displayMessage('success', 'Stock adjusted successfully!');
          this.closeAdjustmentModal();
          this.loadEquipment();
        },
        error: (error) => {
          console.error('Error adjusting stock:', error);
          this.displayMessage('error', 'Failed to adjust stock');
        }
      });
  }

  // Bulk operations
  toggleSelectAll(): void {
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

  openBulkLocationModal(): void {
    if (this.selectedItems.size === 0) {
      this.displayMessage('error', 'Please select items to update location');
      return;
    }
    this.newLocation = '';
    this.showLocationModal = true;
  }

  closeLocationModal(): void {
    this.showLocationModal = false;
    this.newLocation = '';
  }

  submitBulkLocation(): void {
    if (!this.newLocation.trim()) {
      this.displayMessage('error', 'Please enter a location');
      return;
    }

    this.selectedItems.forEach(id => {
      const item = this.equipment.find(e => e.id === id);
      if (item) {
        item.location = this.newLocation;
      }
    });

    this.displayMessage('success', `Location updated for ${this.selectedItems.size} items`);
    this.closeLocationModal();
    this.selectedItems.clear();
    this.selectAll = false;
    this.applyFilters();
  }

  // Export functions
  exportToCSV(): void {
    const headers = ['Code', 'Product', 'Category', 'Location', 'Stock', 'Available', 'Borrowed', 'Reorder Point', 'Supplier', 'Last Audit', 'Status'];
    const rows = this.filteredEquipment.map(item => [
      item.code,
      `"${item.name}"`,
      item.category,
      item.location || 'N/A',
      item.quantityTotal,
      item.quantityAvailable,
      item.quantityBorrowed,
      item.reorderPoint || 0,
      item.supplier || 'N/A',
      item.lastAuditDate?.toLocaleDateString() || 'Never',
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

  exportReorderList(): void {
    const needsReorder = this.equipment.filter(item =>
      item.quantityAvailable <= (item.reorderPoint || 0)
    );

    const headers = ['Code', 'Product', 'Category', 'Current Stock', 'Reorder Point', 'Suggested Order Qty', 'Supplier'];
    const rows = needsReorder.map(item => [
      item.code,
      `"${item.name}"`,
      item.category,
      item.quantityTotal,
      item.reorderPoint || 0,
      Math.max((item.reorderPoint || 0) * 2 - item.quantityTotal, 0),
      item.supplier || 'N/A'
    ]);

    let csvContent = headers.join(',') + '\n';
    rows.forEach(row => {
      csvContent += row.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reorder-list-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    this.displayMessage('success', 'Reorder list exported successfully');
  }

  // Utility methods
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

  get categories(): string[] {
    return ['All products', ...new Set(this.equipment.map(e => e.category))];
  }

  getDiscrepancy(itemId: number): number {
    const item = this.equipment.find(e => e.id === itemId);
    const auditCount = this.auditItems.get(itemId);
    if (!item || auditCount === undefined) return 0;
    return auditCount - item.quantityTotal;
  }

  get reorderItems(): EquipmentInventoryItem[] {
    return this.filteredEquipment.filter(item =>
      item.quantityAvailable <= (item.reorderPoint || 0)
    );
  }

  getSuggestedOrderQty(item: EquipmentInventoryItem): number {
    return Math.max((item.reorderPoint || 0) * 2 - item.quantityTotal, 0);
  }
}