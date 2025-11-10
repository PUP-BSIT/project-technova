import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Request {
  id: string;
  title: string;
  type: 'Equipment' | 'Facility';
  status: 'Pending' | 'Approved' | 'Rejected' | 'Returned';
  quantity?: number;
  requestDate: string;
  returnDate?: string;
  dayOfEvent?: string;
  adminNotes: string;
}

@Component({
  selector: 'app-org-my-request',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-request.html',
  styleUrls: ['./my-request.scss']
})
export class OrgMyRequestComponent implements OnInit {
  searchQuery = '';
  selectedStatus = 'All Status';
  selectedType = 'All Types';

  allRequests: Request[] = [
    { id: 'R1045', title: 'Microphone', type: 'Equipment', status: 'Pending', quantity: 2, requestDate: '10/1/2025', returnDate: '10/4/2025', adminNotes: 'Pending stock check' },
    { id: 'R1046', title: '4th Floor, Engr. AVR', type: 'Facility', status: 'Approved', requestDate: '10/1/2025', dayOfEvent: '10/4/2025', adminNotes: 'Confirmed for 8:00 AM - 12:00 PM' },
    { id: 'R1047', title: 'Speaker', type: 'Equipment', status: 'Returned', quantity: 1, requestDate: '10/1/2025', returnDate: '10/4/2025', adminNotes: 'Item returned in good condition' }
  ];

  ngOnInit(): void {
    // Load requests data if needed
  }

  get filteredRequests(): Request[] {
    let filtered = this.allRequests;

    // Filter by search query
    if (this.searchQuery) {
      filtered = filtered.filter(request =>
        request.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        request.id.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }

    // Filter by status
    if (this.selectedStatus !== 'All Status') {
      filtered = filtered.filter(request => request.status === this.selectedStatus);
    }

    // Filter by type
    if (this.selectedType !== 'All Types') {
      filtered = filtered.filter(request => request.type === this.selectedType);
    }

    return filtered;
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      Approved: 'status-approved',
      Pending: 'status-pending',
      Rejected: 'status-rejected',
      Returned: 'status-returned'
    };
    return map[status] || '';
  }
}

