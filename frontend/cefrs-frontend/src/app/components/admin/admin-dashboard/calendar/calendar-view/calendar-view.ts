import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventClickArg, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { Subject, takeUntil } from 'rxjs';
import { CalendarService, CalendarEvent } from '../../../../../services/calendar.service';
import { AuthService } from '../../../../../services/auth';

@Component({
  selector: 'app-calendar-view',
  standalone: true,
  imports: [
    CommonModule,
    FullCalendarModule,
    FormsModule
  ],
  templateUrl: './calendar-view.html',
  styleUrls: ['./calendar-view.scss']
})
export class CalendarView implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
    },
    weekends: true,
    editable: false,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    height: 'auto',
    events: [],
    eventClick: this.handleEventClick.bind(this),
    dateClick: this.handleDateClick.bind(this),
    eventDidMount: this.handleEventDidMount.bind(this)
  };

  events: CalendarEvent[] = [];
  selectedEvent: CalendarEvent | null = null;
  showEventModal = false;
  filterType: 'all' | 'facility' | 'equipment' = 'all';
  filterStatus: 'all' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'BORROWED' | 'RETURNED' | 'OVERDUE' = 'all';
  isLoading = false;
  adminId: number = 0;

  constructor(
    private calendarService: CalendarService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadAdminId();
    this.loadCalendarEvents();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAdminId(): void {
    this.authService.getUserProfile()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (profile) => {
          this.adminId = profile.id;
        },
        error: (error) => {
          console.error('Error loading admin profile:', error);
        }
      });
  }

  loadCalendarEvents(): void {
    this.isLoading = true;
    this.calendarService.getAllCalendarEvents()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (events) => {
          this.events = events;
          this.updateCalendarEvents();
          this.isLoading = false;
          console.log('Calendar events loaded:', events);
        },
        error: (error) => {
          console.error('Error loading calendar events:', error);
          this.isLoading = false;
          alert('Failed to load calendar events');
        }
      });
  }

  updateCalendarEvents(): void {
    let filteredEvents = this.events;

    // Filter by type
    if (this.filterType !== 'all') {
      filteredEvents = filteredEvents.filter(event => event.extendedProps.type === this.filterType);
    }

    // Filter by status
    if (this.filterStatus !== 'all') {
      filteredEvents = filteredEvents.filter(event => event.extendedProps.status === this.filterStatus);
    }

    this.calendarOptions.events = filteredEvents as EventInput[];
  }

  handleEventClick(clickInfo: EventClickArg): void {
    const event = this.events.find(e => e.id === clickInfo.event.id);
    if (event) {
      this.selectedEvent = event;
      this.showEventModal = true;
    }
  }

  handleDateClick(arg: any): void {
    console.log('Date clicked:', arg.dateStr);
    // We can implement create new reservation/borrowing here
  }

  handleEventDidMount(info: any): void {
    // Add tooltip or additional styling
    info.el.setAttribute('title', info.event.title);
  }

  closeModal(): void {
    this.showEventModal = false;
    this.selectedEvent = null;
  }

  onFilterTypeChange(type: 'all' | 'facility' | 'equipment'): void {
    this.filterType = type;
    this.updateCalendarEvents();
  }

  onFilterStatusChange(status: 'all' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'BORROWED' | 'RETURNED' | 'OVERDUE'): void {
    this.filterStatus = status;
    this.updateCalendarEvents();
  }

  approveEvent(): void {
    if (!this.selectedEvent) return;

    const eventId = this.getEventIdNumber(this.selectedEvent.id);
    const eventType = this.selectedEvent.extendedProps.type;
    const notes = prompt('Enter approval notes (optional):') || '';

    if (eventType === 'facility') {
      this.calendarService.approveFacilityReservation(eventId, this.adminId, notes)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            alert('Facility reservation approved!');
            this.loadCalendarEvents(); // Reload events
            this.closeModal();
          },
          error: (error) => {
            console.error('Error approving facility reservation:', error);
            alert('Failed to approve reservation');
          }
        });
    } else if (eventType === 'equipment') {
      this.calendarService.approveEquipmentBorrowing(eventId, this.adminId, notes)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            alert('Equipment borrowing approved!');
            this.loadCalendarEvents(); // Reload events
            this.closeModal();
          },
          error: (error) => {
            console.error('Error approving equipment borrowing:', error);
            alert('Failed to approve borrowing');
          }
        });
    }
  }

  rejectEvent(): void {
    if (!this.selectedEvent) return;

    const eventId = this.getEventIdNumber(this.selectedEvent.id);
    const eventType = this.selectedEvent.extendedProps.type;
    const notes = prompt('Enter rejection reason:');

    if (!notes) {
      alert('Rejection reason is required');
      return;
    }

    if (eventType === 'facility') {
      this.calendarService.rejectFacilityReservation(eventId, this.adminId, notes)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            alert('Facility reservation rejected!');
            this.loadCalendarEvents();
            this.closeModal();
          },
          error: (error) => {
            console.error('Error rejecting facility reservation:', error);
            alert('Failed to reject reservation');
          }
        });
    } else if (eventType === 'equipment') {
      this.calendarService.rejectEquipmentBorrowing(eventId, this.adminId, notes)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            alert('Equipment borrowing rejected!');
            this.loadCalendarEvents();
            this.closeModal();
          },
          error: (error) => {
            console.error('Error rejecting equipment borrowing:', error);
            alert('Failed to reject borrowing');
          }
        });
    }
  }

  deleteEvent(): void {
    if (!this.selectedEvent) return;

    if (!confirm('Are you sure you want to delete this event?')) {
      return;
    }

    const eventId = this.getEventIdNumber(this.selectedEvent.id);
    const eventType = this.selectedEvent.extendedProps.type;

    if (eventType === 'facility') {
      this.calendarService.deleteFacilityReservation(eventId, this.adminId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            alert('Facility reservation deleted!');
            this.loadCalendarEvents();
            this.closeModal();
          },
          error: (error) => {
            console.error('Error deleting facility reservation:', error);
            alert('Failed to delete reservation');
          }
        });
    } else if (eventType === 'equipment') {
      this.calendarService.deleteEquipmentBorrowing(eventId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            alert('Equipment borrowing deleted!');
            this.loadCalendarEvents();
            this.closeModal();
          },
          error: (error) => {
            console.error('Error deleting equipment borrowing:', error);
            alert('Failed to delete borrowing');
          }
        });
    }
  }

  // Extract numeric ID from event ID string (e.g., "facility-123" to 123)
  private getEventIdNumber(eventId: string): number {
    const parts = eventId.split('-');
    return parseInt(parts[1], 10);
  }

  getStatusBadgeClass(status: string): string {
    const statusMap: Record<string, string> = {
      'PENDING': 'badge-pending',
      'APPROVED': 'badge-approved',
      'REJECTED': 'badge-rejected',
      'BORROWED': 'badge-borrowed',
      'RETURNED': 'badge-returned',
      'OVERDUE': 'badge-overdue'
    };
    return statusMap[status] || '';
  }
}