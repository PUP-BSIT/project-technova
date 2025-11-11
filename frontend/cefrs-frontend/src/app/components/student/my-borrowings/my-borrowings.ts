import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EquipmentBorrowingService, EquipmentBorrowing } from '../../../services/equipment-borrowing.service';

@Component({
  selector: 'app-my-borrowings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-borrowings.html',
  styleUrls: ['./my-borrowings.scss']
})
export class MyBorrowingsComponent implements OnInit {
  borrowings: EquipmentBorrowing[] = [];
  loading = false;
  error: string | null = null;
  searchQuery = '';
  selectedStatus = 'All';

  constructor(
    private borrowingService: EquipmentBorrowingService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.loadBorrowings();
  }

  loadBorrowings(): void {
    this.loading = true;
    this.borrowingService.getMyBorrowings().subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success && response.data) {
          this.borrowings = response.data;
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Failed to load borrowings';
        console.error('Error loading borrowings:', err);
      }
    });
  }

  get filteredBorrowings(): EquipmentBorrowing[] {
    let filtered = this.borrowings;

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(b =>
        b.equipmentName.toLowerCase().includes(query) ||
        b.purpose.toLowerCase().includes(query)
      );
    }

    if (this.selectedStatus !== 'All') {
      filtered = filtered.filter(b => b.status === this.selectedStatus);
    }

    return filtered.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  getStatusClass(status: string): string {
    const statusMap: Record<string, string> = {
      'PENDING': 'status-pending',
      'APPROVED': 'status-approved',
      'BORROWED': 'status-borrowed',
      'REJECTED': 'status-rejected',
      'RETURNED': 'status-returned',
      'OVERDUE': 'status-overdue'
    };
    return statusMap[status] || '';
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString();
  }

  navigateToRequest(): void {
    this.router.navigate(['/student/equipment-borrowing-request']);
  }
}

