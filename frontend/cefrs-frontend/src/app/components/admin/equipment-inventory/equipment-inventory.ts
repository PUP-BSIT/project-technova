import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
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

  clearSearch(): void {
    this.searchQuery = '';
    this.applyFilters();
  }

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

  // Dropdown states
  showExportDropdown: boolean = false;
  showReorderDropdown: boolean = false;

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

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.export-dropdown')) {
      this.showExportDropdown = false;
      this.showReorderDropdown = false;
    }
  }

  toggleExportDropdown(event: Event): void {
    event.stopPropagation();
    this.showExportDropdown = !this.showExportDropdown;
    this.showReorderDropdown = false;
  }

  toggleReorderDropdown(event: Event): void {
    event.stopPropagation();
    this.showReorderDropdown = !this.showReorderDropdown;
    this.showExportDropdown = false;
  }

  closeDropdowns(): void {
    this.showExportDropdown = false;
    this.showReorderDropdown = false;
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
          this.equipment = equipmentList.map(e => {
            // Calculate borrowed as the difference between total and available
            const borrowed = Math.max(0, e.quantityTotal - e.quantityAvailable);

            return {
              id: e.id,
              name: e.name,
              code: `EQ-${e.id.toString().padStart(4, '0')}`,
              category: e.category,
              quantityTotal: e.quantityTotal,
              quantityAvailable: e.quantityAvailable,
              quantityBorrowed: borrowed,
              description: e.description,
              imageUrl: e.imageUrl,
              status: e.status,
              condition: this.getConditionFromQuantity(e.quantityAvailable, e.quantityTotal),
              lastModified: new Date(),
              selected: false,
              editing: false,
              location: (e as any).location || 'Not Assigned',
              supplier: (e as any).supplier || 'Not Assigned',
              reorderPoint: Math.floor(e.quantityTotal * 0.3),
              lastAuditDate: new Date(),
              needsAttention: e.quantityAvailable <= Math.floor(e.quantityTotal * 0.3)
            };
          });
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

  getConditionFromQuantity(available: number, total: number): string {
    if (total === 0) return 'Out of Stock';
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

  switchView(mode: 'table' | 'audit' | 'reorder'): void {
    this.viewMode = mode;
    if (mode === 'audit') {
      this.startAuditMode();
    } else if (mode === 'reorder') {
      this.applyFilters();
    }
  }

  startAuditMode(): void {
    this.auditMode = true;
    this.auditItems.clear();
    this.filteredEquipment.forEach(item => {
      this.auditItems.set(item.id, item.quantityTotal);
    });
  }

  updateAuditCount(itemId: number, count: number): void {
    this.auditItems.set(itemId, Math.max(0, count));
  }

  completeAudit(): void {
    this.showConfirm(
      'Complete audit and apply adjustments? This will update all stock quantities based on your counts.',
      () => this.executeAuditCompletion()
    );
  }

  private executeAuditCompletion(): void {
    const adjustments: Promise<any>[] = [];

    this.auditItems.forEach((auditCount, id) => {
      const item = this.equipment.find(e => e.id === id);
      if (item && auditCount !== item.quantityTotal) {
        const difference = auditCount - item.quantityTotal;

        // Properly maintain the borrowed count
        // The borrowed count should remain the same, we're just adjusting total
        const currentBorrowed = item.quantityBorrowed;
        const newTotal = auditCount;
        const newAvailable = Math.max(0, newTotal - currentBorrowed);

        const requestData: any = {
          name: item.name,
          category: item.category,
          quantityTotal: newTotal,
          quantityAvailable: newAvailable,
          description: item.description,
          status: item.status,
          location: item.location,
          supplier: item.supplier
        };

        if (item.imageUrl && !item.imageUrl.startsWith('data:image')) {
          requestData.imageUrl = item.imageUrl;
        } else {
          requestData.imageUrl = '';
        }

        console.log(`Updating item ${id} - Total: ${newTotal}, Available: ${newAvailable}, Borrowed: ${currentBorrowed}`);

        adjustments.push(
          new Promise((resolve, reject) => {
            this.equipmentService.updateEquipment(id, requestData)
              .pipe(takeUntil(this.destroy$))
              .subscribe({
                next: (response) => {
                  console.log(`✅ Successfully updated item ${id}`);
                  resolve(response);
                },
                error: (error) => {
                  console.error(`❌ Failed to update item ${id}:`, error);
                  resolve(null);
                }
              });
          })
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
        this.displayMessage('error', 'Some adjustments failed. Please check console for details.');
      });
  }

  cancelAudit(): void {
    this.auditMode = false;
    this.auditItems.clear();
    this.viewMode = 'table';
  }

  openAdjustmentModal(item: EquipmentInventoryItem): void {
    this.selectedEquipment = { ...item };
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

    let newTotal = this.adjustmentQuantity;

    if (this.adjustmentType === 'add') {
      newTotal = this.selectedEquipment.quantityTotal + this.adjustmentQuantity;
    } else if (this.adjustmentType === 'remove') {
      newTotal = this.selectedEquipment.quantityTotal - this.adjustmentQuantity;
    }

    if (newTotal < 0) {
      this.displayMessage('error', 'Quantity cannot be negative');
      return;
    }

    // Properly calculate available based on borrowed count
    const currentBorrowed = this.selectedEquipment.quantityBorrowed;

    // If new total is less than borrowed, we need to adjust
    if (newTotal < currentBorrowed) {
      this.displayMessage('error', `Cannot set total to ${newTotal}. There are ${currentBorrowed} items currently borrowed.`);
      return;
    }

    const newAvailable = newTotal - currentBorrowed;

    const requestData: any = {
      name: this.selectedEquipment.name,
      category: this.selectedEquipment.category,
      quantityTotal: newTotal,
      quantityAvailable: newAvailable,
      description: this.selectedEquipment.description,
      status: this.selectedEquipment.status,
      location: this.selectedEquipment.location,
      supplier: this.selectedEquipment.supplier
    };

    if (this.selectedEquipment.imageUrl && !this.selectedEquipment.imageUrl.startsWith('data:image')) {
      requestData.imageUrl = this.selectedEquipment.imageUrl;
    } else {
      requestData.imageUrl = '';
    }

    console.log('Submitting adjustment:', {
      ...requestData,
      calculatedBorrowed: currentBorrowed
    });

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

    const updatePromises: Promise<any>[] = [];

    this.selectedItems.forEach(id => {
      const item = this.equipment.find(e => e.id === id);
      if (item) {
        item.location = this.newLocation;

        const requestData: any = {
          name: item.name,
          category: item.category,
          quantityTotal: item.quantityTotal,
          quantityAvailable: item.quantityAvailable,
          description: item.description,
          status: item.status,
          location: this.newLocation,
          supplier: item.supplier
        };

        updatePromises.push(
          this.equipmentService.updateEquipment(id, requestData).toPromise()
        );
      }
    });

    Promise.all(updatePromises)
      .then(() => {
        this.displayMessage('success', `Location updated for ${this.selectedItems.size} items`);
        this.closeLocationModal();
        this.selectedItems.clear();
        this.selectAll = false;
        this.loadEquipment();
      })
      .catch(() => this.displayMessage('error', 'Failed to update some items'));
  }

  exportToCSV(): void {
    this.closeDropdowns();
    const headers = ['Code', 'Product', 'Category', 'Location', 'Stock', 'Available', 'Borrowed', 'Reorder Point', 'Supplier', 'Last Audit', 'Status'];
    const rows = this.filteredEquipment.map(item => [
      this.escapeCSV(item.code),
      this.escapeCSV(item.name),
      this.escapeCSV(item.category),
      this.escapeCSV(item.location || 'N/A'),
      item.quantityTotal,
      item.quantityAvailable,
      item.quantityBorrowed,
      item.reorderPoint || 0,
      this.escapeCSV(item.supplier || 'N/A'),
      item.lastAuditDate?.toLocaleDateString() || 'Never',
      this.escapeCSV(item.condition)
    ]);

    let csvContent = headers.join(',') + '\n';
    rows.forEach(row => {
      csvContent += row.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `equipment-inventory-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);

    this.displayMessage('success', 'Inventory exported to CSV successfully');
  }

  exportToPDF(): void {
    this.closeDropdowns();
    const printContent = this.generatePrintableInventory();

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();

      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  }

  private generatePrintableInventory(): string {
    const today = new Date().toLocaleDateString();
    const rows = this.filteredEquipment.map(item => `
      <tr>
        <td>${item.code}</td>
        <td>${item.name}</td>
        <td>${item.category}</td>
        <td>${item.location || 'N/A'}</td>
        <td style="text-align: center;">${item.quantityTotal}</td>
        <td style="text-align: center;">${item.quantityAvailable}</td>
        <td style="text-align: center;">${item.quantityBorrowed}</td>
        <td style="text-align: center;">${item.reorderPoint || 0}</td>
        <td>${item.supplier || 'N/A'}</td>
        <td>${item.lastAuditDate?.toLocaleDateString() || 'Never'}</td>
        <td>${item.condition}</td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Equipment Inventory Report - ${today}</title>
        <style>
          @page { size: A4 landscape; margin: 15mm; }
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #69040C; padding-bottom: 15px; }
          .header h1 { margin: 0; color: #69040C; font-size: 24px; }
          .header p { margin: 5px 0 0 0; color: #666; font-size: 14px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 11px; }
          th { background-color: #69040C; color: white; padding: 12px 8px; text-align: left; font-weight: 600; border: 1px solid #ddd; }
          td { padding: 10px 8px; border: 1px solid #ddd; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #666; border-top: 1px solid #ddd; padding-top: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Equipment Inventory Report</h1>
          <p>Generated on ${today} | Total Items: ${this.filteredEquipment.length}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Code</th><th>Product</th><th>Category</th><th>Location</th>
              <th>Stock</th><th>Available</th><th>Borrowed</th><th>Reorder Point</th>
              <th>Supplier</th><th>Last Audit</th><th>Status</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <div class="footer">
          <p>CEFRS - Equipment Inventory Management System</p>
          <p>This report contains ${this.filteredEquipment.length} item(s)</p>
        </div>
      </body>
      </html>
    `;
  }

  exportReorderList(): void {
    this.closeDropdowns();
    const needsReorder = this.equipment.filter(item =>
      item.quantityAvailable <= (item.reorderPoint || 0)
    );

    const headers = ['Code', 'Product', 'Category', 'Current Stock', 'Reorder Point', 'Suggested Order Qty', 'Supplier'];
    const rows = needsReorder.map(item => [
      this.escapeCSV(item.code),
      this.escapeCSV(item.name),
      this.escapeCSV(item.category),
      item.quantityTotal,
      item.reorderPoint || 0,
      Math.max((item.reorderPoint || 0) * 2 - item.quantityTotal, 0),
      this.escapeCSV(item.supplier || 'N/A')
    ]);

    let csvContent = headers.join(',') + '\n';
    rows.forEach(row => {
      csvContent += row.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reorder-list-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);

    this.displayMessage('success', 'Reorder list exported successfully');
  }

  exportReorderListPDF(): void {
    this.closeDropdowns();
    const needsReorder = this.equipment.filter(item =>
      item.quantityAvailable <= (item.reorderPoint || 0)
    );

    if (needsReorder.length === 0) {
      this.displayMessage('error', 'No items need reordering');
      return;
    }

    const today = new Date().toLocaleDateString();
    const rows = needsReorder.map(item => `
      <tr>
        <td>${item.code}</td>
        <td>${item.name}</td>
        <td>${item.category}</td>
        <td style="text-align: center;">${item.quantityTotal}</td>
        <td style="text-align: center;">${item.reorderPoint || 0}</td>
        <td style="text-align: center; font-weight: bold; color: #4CAF50;">${Math.max((item.reorderPoint || 0) * 2 - item.quantityTotal, 0)}</td>
        <td>${item.supplier || 'N/A'}</td>
      </tr>
    `).join('');

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Reorder List - ${today}</title>
        <style>
          @page { size: A4; margin: 15mm; }
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #ffc107; padding-bottom: 15px; }
          .header h1 { margin: 0; color: #ffc107; font-size: 24px; }
          .alert { background: #fff3cd; border: 2px solid #ffc107; padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: center; font-weight: bold; color: #856404; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
          th { background-color: #ffc107; color: #333; padding: 12px 8px; text-align: left; font-weight: 600; border: 1px solid #ddd; }
          td { padding: 10px 8px; border: 1px solid #ddd; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #666; border-top: 1px solid #ddd; padding-top: 10px; }
        </style>
      </head>
      <body>
        <div class="header"><h1>⚠️ Equipment Reorder List</h1><p>Generated on ${today}</p></div>
        <div class="alert">${needsReorder.length} item(s) need to be reordered</div>
        <table>
          <thead>
            <tr><th>Code</th><th>Product</th><th>Category</th><th>Current Stock</th><th>Reorder Point</th><th>Suggested Order</th><th>Supplier</th></tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <div class="footer">
          <p>CEFRS - Equipment Inventory Management System</p>
          <p>Please process these orders as soon as possible</p>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => printWindow.print(), 250);
    }
  }

  private escapeCSV(value: string): string {
    if (value == null) return '';
    const stringValue = String(value);
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  }

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