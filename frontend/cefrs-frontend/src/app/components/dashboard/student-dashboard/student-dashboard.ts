import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth';
import { AuditLogService, AuditLog } from '../../../services/audit-log.service';
import { EquipmentService } from '../../../services/equipment.service';
import { FacilityService } from '../../../services/facility.service';
import { ReservationService, ReservationRequest } from '../../../services/reservation.service';
import { EquipmentBorrowingService, BorrowingRequest } from '../../../services/equipment-borrowing.service';
import { SidebarComponent } from '../../sidebar/sidebar';

// --- INTERFACES ---
interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: string;
  organizationName: string;
  isActive: boolean;
  name?: string;
}

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

interface Facility {
  id: number;
  name: string;
  type: string;
  building: string;
  floor: string;
  capacity: number;
  description: string;
  imageUrl: string;
  status: string;
}

interface Equipment {
  id: number;
  name: string;
  description: string;
  category: string;
  quantityAvailable: number;
  quantityTotal: number;
  imageUrl: string;
  status: string;
}

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SidebarComponent],
  templateUrl: './student-dashboard.html',
  styleUrls: ['./student-dashboard.scss']
})
export class StudentDashboard implements OnInit {
  private authService = inject(AuthService);
  private auditLogService = inject(AuditLogService);
  private equipmentService = inject(EquipmentService);
  private facilityService = inject(FacilityService);
  private reservationService = inject(ReservationService);
  private borrowingService = inject(EquipmentBorrowingService);
  private router = inject(Router);

  currentView: 'dashboard' | 'facilities' | 'equipment' | 'requests' | 'transactions' | 'settings' = 'dashboard';
  user: User | null = null;

  auditLogs: AuditLog[] = [];
  isLoadingLogs = false;
  isLoadingEquipment = false;
  isLoadingFacilities = false;

  stats = {
    activeReservations: 3,
    borrowedEquipment: 10,
    pendingRequests: 2,
    totalRequests: 10
  };

  recentRequests: Request[] = [
    { id: 'R1045', title: 'Conference Room', type: 'Facility', status: 'Approved', requestDate: '10/1/2025', adminNotes: 'Approved for testing purposes' },
    { id: 'R1046', title: 'Microphone', type: 'Equipment', status: 'Pending', quantity: 2, requestDate: '10/1/2025', returnDate: '10/4/2025', adminNotes: 'Pending stock check' },
    { id: 'R1047', title: 'Speaker', type: 'Equipment', status: 'Rejected', quantity: 1, requestDate: '10/1/2025', returnDate: '10/4/2025', adminNotes: 'Facility is booked on requested date' }
  ];

  facilities: Facility[] = [];
  equipment: Equipment[] = [];

  allRequests: Request[] = [
    { id: 'R1045', title: 'Microphone', type: 'Equipment', status: 'Pending', quantity: 2, requestDate: '10/1/2025', returnDate: '10/4/2025', adminNotes: 'Pending stock check' },
    { id: 'R1046', title: '4th Floor, Engr. AVR', type: 'Facility', status: 'Approved', requestDate: '10/1/2025', dayOfEvent: '10/4/2025', adminNotes: 'Confirmed for 8:00 AM - 12:00 PM' },
    { id: 'R1047', title: 'Speaker', type: 'Equipment', status: 'Returned', quantity: 1, requestDate: '10/1/2025', returnDate: '10/4/2025', adminNotes: 'Item returned in good condition' }
  ];

  searchQuery = '';
  selectedCategory = 'All Categories';
  selectedStatus = 'All Status';
  selectedType = 'All Types';

  // Modal state
  showReservationModal = false;
  showSuccessModal = false;
  showEquipmentModal = false;
  showEquipmentSuccessModal = false;
  selectedFacility: Facility | null = null;
  selectedEquipment: Equipment | null = null;
  reservationForm = {
    facilityId: null as number | null,
    reservationDate: '',
    startTime: '',
    endTime: '',
    purpose: ''
  };
  borrowingForm = {
    equipmentId: null as number | null,
    quantity: 1,
    borrowDate: '',
    expectedReturnDate: '',
    purpose: ''
  };
  reservationLoading = false;
  reservationError: string | null = null;
  borrowingLoading = false;
  borrowingError: string | null = null;

  ngOnInit(): void {
    this.fetchUserProfile();
    this.fetchAuditLogs();
    this.fetchEquipment();
    this.fetchFacilities();
  }

  fetchEquipment(): void {
    this.isLoadingEquipment = true;
    this.equipmentService.getAvailableEquipment().subscribe({
      next: (response) => {
        this.equipment = response.data;
        this.isLoadingEquipment = false;
        console.log('Equipment loaded:', this.equipment);
      },
      error: (err) => {
        console.error('Error fetching equipment:', err);
        this.isLoadingEquipment = false;
      }
    });
  }

  fetchFacilities(): void {
    this.isLoadingFacilities = true;
    this.facilityService.getAvailableFacilities().subscribe({
      next: (response: any) => {
        this.facilities = response.data;
        this.isLoadingFacilities = false;
      },
      error: (err: any) => {
        console.error('Error fetching facilities:', err);
        this.isLoadingFacilities = false;
        this.facilities = [];
      }
    });
  }

  fetchAuditLogs(): void {
    this.isLoadingLogs = true;
    this.auditLogService.getMyAuditLogs().subscribe({
      next: (logs) => {
        this.auditLogs = logs;
        this.isLoadingLogs = false;
      },
      error: (err) => {
        console.error('Error fetching audit logs:', err);
        this.isLoadingLogs = false;
      }
    });
  }

  fetchUserProfile(): void {
    this.authService.getUserProfile().subscribe({
      next: (profile) => {
        this.user = profile;
        this.user.name = `${profile.firstName} ${profile.lastName}`;
      },
      error: (err) => {
        console.error('Error fetching user profile:', err);
        this.user = {
          id: 0,
          email: 'guest@example.com',
          firstName: 'Welcome',
          lastName: 'Guest',
          phoneNumber: '',
          role: 'Guest',
          organizationName: '',
          isActive: false,
          name: 'Guest'
        };
      }
    });
  }

  // KEEP ONLY THIS ONE setView METHOD
  setView(view: 'dashboard' | 'facilities' | 'equipment' | 'requests' | 'transactions' | 'settings'): void {
    // Reset search filters when switching views
    this.searchQuery = '';
    this.selectedCategory = 'All Categories';
    this.selectedStatus = 'All Status';
    this.selectedType = 'All Types';

    this.currentView = view;

    if (view === 'settings') {
      this.router.navigate(['/student-dashboard/settings/profile']);
    }

    if (view === 'transactions') {
      this.fetchAuditLogs();
    }
    if (view === 'equipment') {
      this.fetchEquipment();
    }
    if (view === 'facilities') {
      this.fetchFacilities();
    }
  }

  onSidebarViewChange(view: string): void {
    this.setView(view as 'dashboard' | 'facilities' | 'equipment' | 'requests' | 'transactions' | 'settings');
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      Approved: 'status-approved',
      Pending: 'status-pending',
      Rejected: 'status-rejected',
      Returned: 'status-returned',
      Available: 'status-available',
      AVAILABLE: 'status-available',
      Reserved: 'status-reserved'
    };
    return map[status] || '';
  }

  // Filter facilities
  get filteredFacilities(): Facility[] {
    if (!this.searchQuery.trim()) {
      return this.facilities;
    }

    const query = this.searchQuery.toLowerCase();
    return this.facilities.filter(facility =>
      facility.name?.toLowerCase().includes(query) ||
      facility.building?.toLowerCase().includes(query) ||
      facility.floor?.toLowerCase().includes(query) ||
      facility.description?.toLowerCase().includes(query) ||
      facility.type?.toLowerCase().includes(query)
    );
  }

  // Filter equipment
  get filteredEquipment(): Equipment[] {
    let filtered = this.equipment;

    // Filter by category
    if (this.selectedCategory !== 'All Categories') {
      filtered = filtered.filter(item =>
        item.category?.toUpperCase() === this.selectedCategory.toUpperCase()
      );
    }

    // Filter by search query
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.name?.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }

  // Filter requests
  get filteredRequests(): Request[] {
    let filtered = this.allRequests;

    // Filter by status
    if (this.selectedStatus !== 'All Status') {
      filtered = filtered.filter(req => req.status === this.selectedStatus);
    }

    // Filter by type
    if (this.selectedType !== 'All Types') {
      filtered = filtered.filter(req => req.type === this.selectedType);
    }

    // Filter by search query
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(req =>
        req.title.toLowerCase().includes(query) ||
        req.id.toLowerCase().includes(query) ||
        req.adminNotes.toLowerCase().includes(query)
      );
    }

    return filtered;
  }

  // Filter audit logs/transactions
  get filteredAuditLogs(): AuditLog[] {
    if (!this.searchQuery.trim()) {
      return this.auditLogs;
    }

    const query = this.searchQuery.toLowerCase();
    return this.auditLogs.filter(log =>
      log.actionType?.toLowerCase().includes(query) ||
      log.tableName?.toLowerCase().includes(query) ||
      log.oldValues?.toLowerCase().includes(query) ||
      log.newValues?.toLowerCase().includes(query)
    );
  }

  // Open equipment borrowing modal
  requestEquipment(equipmentId: number): void {
    const equipment = this.equipment.find(e => e.id === equipmentId);
    if (equipment && equipment.quantityAvailable > 0) {
      this.selectedEquipment = equipment;
      this.borrowingForm.equipmentId = equipmentId;
      this.borrowingForm.quantity = 1;
      this.borrowingForm.borrowDate = '';
      this.borrowingForm.expectedReturnDate = '';
      this.borrowingForm.purpose = '';
      this.borrowingError = null;
      this.showEquipmentModal = true;
    }
  }

  // Open facility reservation modal
  requestFacility(facilityId: number): void {
    const facility = this.facilities.find(f => f.id === facilityId);
    if (facility && facility.status === 'AVAILABLE') {
      this.selectedFacility = facility;
      this.reservationForm.facilityId = facilityId;
      this.reservationForm.reservationDate = '';
      this.reservationForm.startTime = '';
      this.reservationForm.endTime = '';
      this.reservationForm.purpose = '';
      this.reservationError = null;
      this.showReservationModal = true;
    }
  }

  // Close reservation modal
  closeReservationModal(): void {
    this.showReservationModal = false;
    this.selectedFacility = null;
    this.reservationForm = {
      facilityId: null,
      reservationDate: '',
      startTime: '',
      endTime: '',
      purpose: ''
    };
    this.reservationError = null;
  }

  // Submit reservation request
  submitReservation(): void {
    if (!this.validateReservationForm()) {
      return;
    }

    this.reservationLoading = true;
    this.reservationError = null;

    const request: ReservationRequest = {
      facilityId: this.reservationForm.facilityId!,
      startTime: `${this.reservationForm.reservationDate} ${this.reservationForm.startTime}:00`,
      endTime: `${this.reservationForm.reservationDate} ${this.reservationForm.endTime}:00`,
      purpose: this.reservationForm.purpose
    };

    this.reservationService.createReservation(request).subscribe({
      next: (response) => {
        this.reservationLoading = false;
        if (response.success) {
          this.closeReservationModal();
          this.showSuccessModal = true;
          // Refresh facilities list
          this.fetchFacilities();
        }
      },
      error: (err) => {
        this.reservationLoading = false;
        this.reservationError = err.error?.message || 'Failed to submit reservation request';
        console.error('Error creating reservation:', err);
      }
    });
  }

  // Validate reservation form
  validateReservationForm(): boolean {
    if (!this.reservationForm.facilityId) {
      this.reservationError = 'Please select a facility';
      return false;
    }
    if (!this.reservationForm.reservationDate) {
      this.reservationError = 'Please select a date';
      return false;
    }
    if (!this.reservationForm.startTime) {
      this.reservationError = 'Please select a start time';
      return false;
    }
    if (!this.reservationForm.endTime) {
      this.reservationError = 'Please select an end time';
      return false;
    }
    if (this.reservationForm.startTime >= this.reservationForm.endTime) {
      this.reservationError = 'End time must be after start time';
      return false;
    }
    if (!this.reservationForm.purpose.trim()) {
      this.reservationError = 'Please provide a purpose';
      return false;
    }
    return true;
  }

  // Get minimum date for date picker
  getMinDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  // Close success modal
  closeSuccessModal(): void {
    this.showSuccessModal = false;
  }

  // Close equipment borrowing modal
  closeEquipmentModal(): void {
    this.showEquipmentModal = false;
    this.selectedEquipment = null;
    this.borrowingForm = {
      equipmentId: null,
      quantity: 1,
      borrowDate: '',
      expectedReturnDate: '',
      purpose: ''
    };
    this.borrowingError = null;
  }

  // Submit equipment borrowing request
  submitBorrowing(): void {
    if (!this.validateBorrowingForm()) {
      return;
    }

    this.borrowingLoading = true;
    this.borrowingError = null;

    const request: BorrowingRequest = {
      equipmentId: this.borrowingForm.equipmentId!,
      quantity: this.borrowingForm.quantity,
      borrowDate: this.borrowingForm.borrowDate,
      expectedReturnDate: this.borrowingForm.expectedReturnDate,
      purpose: this.borrowingForm.purpose
    };

    this.borrowingService.createBorrowing(request).subscribe({
      next: (response) => {
        this.borrowingLoading = false;
        if (response.success) {
          this.closeEquipmentModal();
          this.showEquipmentSuccessModal = true;
          // Refresh equipment list
          this.fetchEquipment();
        }
      },
      error: (err) => {
        this.borrowingLoading = false;
        this.borrowingError = err.error?.message || 'Failed to submit borrowing request';
        console.error('Error creating borrowing:', err);
      }
    });
  }

  // Validate borrowing form
  validateBorrowingForm(): boolean {
    if (!this.borrowingForm.equipmentId) {
      this.borrowingError = 'Please select equipment';
      return false;
    }
    const selected = this.selectedEquipment;
    if (this.borrowingForm.quantity > (selected?.quantityAvailable || 0)) {
      this.borrowingError = `Only ${selected?.quantityAvailable} items available`;
      return false;
    }
    if (this.borrowingForm.quantity < 1) {
      this.borrowingError = 'Quantity must be at least 1';
      return false;
    }
    if (!this.borrowingForm.borrowDate) {
      this.borrowingError = 'Please select a borrow date';
      return false;
    }
    if (!this.borrowingForm.expectedReturnDate) {
      this.borrowingError = 'Please select an expected return date';
      return false;
    }
    if (this.borrowingForm.expectedReturnDate <= this.borrowingForm.borrowDate) {
      this.borrowingError = 'Return date must be after borrow date';
      return false;
    }
    if (!this.borrowingForm.purpose.trim()) {
      this.borrowingError = 'Please provide a purpose';
      return false;
    }
    return true;
  }

  // Get max quantity for selected equipment
  getMaxBorrowingQuantity(): number {
    return this.selectedEquipment?.quantityAvailable || 0;
  }

  // Close equipment success modal
  closeEquipmentSuccessModal(): void {
    this.showEquipmentSuccessModal = false;
  }
}