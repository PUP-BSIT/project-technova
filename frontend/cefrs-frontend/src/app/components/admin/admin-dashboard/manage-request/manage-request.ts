import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Request {
  id: string;
  type: 'facility' | 'equipment';
  name: string;
  requester: string;
  dateTime?: string;
  capacity?: number;
  participants?: number;
  notes?: string;
  status: 'pending' | 'approved' | 'declined';
  burrow?: string;
  return?: string;
  condition?: string;
}

@Component({
  selector: 'app-manage-request',
  templateUrl: './manage-request.html',
  styleUrls: ['./manage-request.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class ManageRequest {
  searchText: string = '';
  showApproveModal: boolean = false;
  showDeclineModal: boolean = false;
  selectedRequest: Request | null = null;
  approvalNotes: string = '';
  declineReason: string = '';
  sendNotification: boolean = true;

  requests: Request[] = [
    {
      id: 'R1023',
      type: 'facility',
      name: 'Conference Room',
      requester: 'Angelicka Uy',
      dateTime: 'January 2, 2026(10:00AM - 12:00PM)',
      capacity: 40,
      participants: 35,
      notes: 'Seminar on App Development',
      status: 'pending'
    },
    {
      id: 'R1045',
      type: 'equipment',
      name: 'Projector',
      requester: 'Patricia Relente',
      burrow: 'Jan 3, 2026',
      return: 'Jan 4, 2026',
      condition: 'Good',
      notes: 'Seminar on App Development',
      status: 'approved'
    },
    {
      id: 'R1046',
      type: 'equipment',
      name: 'Projector',
      requester: 'Gener Andaya',
      burrow: 'Jan 3, 2026',
      return: 'Jan 4, 2026',
      condition: 'Good',
      notes: 'Seminar on App Development',
      status: 'declined'
    }
  ];

  approveRequest(request: Request): void {
    this.selectedRequest = request;
    this.approvalNotes = '';
    this.sendNotification = true;
    this.showApproveModal = true;
  }

  declineRequest(request: Request): void {
    this.selectedRequest = request;
    this.declineReason = '';
    this.sendNotification = true;
    this.showDeclineModal = true;
  }

  confirmApproval(): void {
    if (this.selectedRequest) {
      console.log('Approving request:', this.selectedRequest);
      console.log('Approval notes:', this.approvalNotes);
      console.log('Send notification:', this.sendNotification);
      
      // Update request status
      this.selectedRequest.status = 'approved';
      
      // Implement your approval logic here
      // e.g., API call to update the request
      
      this.closeApproveModal();
    }
  }

  confirmDecline(): void {
    if (this.selectedRequest && this.declineReason.trim()) {
      console.log('Declining request:', this.selectedRequest);
      console.log('Decline reason:', this.declineReason);
      console.log('Send notification:', this.sendNotification);
      
      // Update request status
      this.selectedRequest.status = 'declined';
      
      // Implement your decline logic here
      // e.g., API call to update the request
      
      this.closeDeclineModal();
    }
  }

  closeApproveModal(): void {
    this.showApproveModal = false;
    this.selectedRequest = null;
    this.approvalNotes = '';
  }

  closeDeclineModal(): void {
    this.showDeclineModal = false;
    this.selectedRequest = null;
    this.declineReason = '';
  }
}