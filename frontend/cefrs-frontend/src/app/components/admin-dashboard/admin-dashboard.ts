import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface NavItem {
  id: string;
  label: string;
}

interface PendingRequest {
  type: 'equipment' | 'facility';
  name: string;
  details: string;
  date: string;
}

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

interface Facility {
  id: string;
  name: string;
  location: string;
  capacity: number;
  description: string;
  status: 'available' | 'maintenance' | 'unavailable';
}

interface Equipment {
  id: string;
  name: string;
  category: string;
  condition: string;
  availability: 'available' | 'borrowed';
  borrowedBy?: string;
  dueDate?: string;
}

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class AdminDashboard {
  currentView: string = 'dashboard';
  searchText: string = '';

  navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'manage-request', label: 'Manage Request' },
    { id: 'facilities', label: 'Facilities' },
    { id: 'equipment', label: 'Equipment' },
    { id: 'report-logs', label: 'Report and Logs' }
  ];

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
      id: 'R1045',
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

  facilities: Facility[] = [
    {
      id: 'R1023',
      name: 'Aboitiz',
      location: 'Building A',
      capacity: 40,
      description: 'Suitable for classes',
      status: 'available'
    },
    {
      id: 'R1024',
      name: 'Computer Lab 2',
      location: 'Building A',
      capacity: 45,
      description: 'Suitable for classes',
      status: 'maintenance'
    },
    {
      id: 'R1025',
      name: 'Conference Room',
      location: 'Building A',
      capacity: 45,
      description: '',
      status: 'unavailable'
    }
  ];

  equipment: Equipment[] = [
    {
      id: 'E001',
      name: 'Projector',
      category: 'Mulitmedia',
      condition: 'Good',
      availability: 'available'
    },
    {
      id: 'E001',
      name: 'Speaker',
      category: 'Audio',
      condition: 'Good',
      availability: 'borrowed',
      borrowedBy: 'Kevin Barcelos',
      dueDate: 'Jan 3, 2025'
    }
  ];

  setCurrentView(view: string): void {
    this.currentView = view;
  }

  getStatusText(status: string): string {
    if (status === 'maintenance') {
      return 'Under Maintenance';
    }
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  approveRequest(request: Request | PendingRequest): void {
    console.log('Approving request:', request);
    // Implement approval logic here
  }

  declineRequest(request: Request | PendingRequest): void {
    console.log('Declining request:', request);
    // Implement decline logic here
  }

  addNewFacility(): void {
    console.log('Adding new facility');
    // Implement add facility logic here
  }

  addNewEquipment(): void {
    console.log('Adding new equipment');
    // Implement add equipment logic here
  }

  editItem(item: Facility | Equipment): void {
    console.log('Editing item:', item);
    // Implement edit logic here
  }

  deleteItem(item: Facility | Equipment): void {
    console.log('Deleting item:', item);
    // Implement delete logic here
  }

  logout(): void {
    console.log('Logging out');
    // Implement logout logic here
  }
}