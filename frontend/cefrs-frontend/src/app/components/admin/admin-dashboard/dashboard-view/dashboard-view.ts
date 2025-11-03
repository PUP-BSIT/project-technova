import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface PendingRequest {
  type: 'equipment' | 'facility';
  name: string;
  details: string;
  date: string;
}

@Component({
  selector: 'app-dashboard-view',
  templateUrl: './dashboard-view.html',
  styleUrls: ['./dashboard-view.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class DashboardView {
  pendingRequests: PendingRequest[] = [
    {
      type: 'equipment',
      name: 'Jane Doe',
      details: 'Projector (2 units)',
      date: '2025-10-06'
    },
    {
      type: 'facility',
      name: 'CS Society',
      details: 'Computer Lab 1',
      date: '2025-10-07'
    },
    {
      type: 'facility',
      name: 'John Doe',
      details: 'Conference Room A',
      date: '2025-10-05'
    }
  ];

  approveRequest(request: PendingRequest): void {
    console.log('Approving request:', request);
    // Implement approval logic here
  }

  declineRequest(request: PendingRequest): void {
    console.log('Declining request:', request);
    // Implement decline logic here
  }
}