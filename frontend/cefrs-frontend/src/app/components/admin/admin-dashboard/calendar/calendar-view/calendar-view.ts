import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventClickArg, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  type: 'facility' | 'equipment';
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'BORROWED' | 'RETURNED' | 'OVERDUE';
  backgroundColor: string;
  borderColor: string;
  extendedProps: {
    userName: string;
    userEmail: string;
    purpose?: string;
    quantity?: number;
    adminNotes?: string;
  };
}

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
export class CalendarView implements OnInit {
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

  ngOnInit(): void {
    this.loadCalendarEvents();
  }

  loadCalendarEvents(): void {
    // TODO: Replace with actual API calls to fetch events
    const sampleEvents: CalendarEvent[] = [
      // Facility Reservations
      {
        id: 'FR-1',
        title: 'Conference Room A - Computer Society',
        start: '2025-11-07T09:00:00',
        end: '2025-11-07T12:00:00',
        type: 'facility',
        status: 'APPROVED',
        backgroundColor: '#10b981',
        borderColor: '#059669',
        extendedProps: {
          userName: 'CS Society',
          userEmail: 'cs@example.com',
          purpose: 'Monthly meeting'
        }
      },
      {
        id: 'FR-2',
        title: 'Computer Lab 1 - Jane Doe',
        start: '2025-11-08T13:00:00',
        end: '2025-11-08T17:00:00',
        type: 'facility',
        status: 'PENDING',
        backgroundColor: '#f59e0b',
        borderColor: '#d97706',
        extendedProps: {
          userName: 'Jane Doe',
          userEmail: 'jane@example.com',
          purpose: 'Programming workshop'
        }
      },
      {
        id: 'FR-3',
        title: 'Auditorium - Central Student Council',
        start: '2025-11-10T08:00:00',
        end: '2025-11-10T18:00:00',
        type: 'facility',
        status: 'APPROVED',
        backgroundColor: '#10b981',
        borderColor: '#059669',
        extendedProps: {
          userName: 'Central Student Council',
          userEmail: 'csc@example.com',
          purpose: 'Annual event'
        }
      },
      // Equipment Borrowing
      {
        id: 'EB-1',
        title: 'Projector (2 units) - Jennie Doe',
        start: '2025-11-06',
        end: '2025-11-09',
        type: 'equipment',
        status: 'BORROWED',
        backgroundColor: '#3b82f6',
        borderColor: '#2563eb',
        extendedProps: {
          userName: 'Jenny Doe',
          userEmail: 'jenny@example.com',
          quantity: 2,
          purpose: 'Seminar presentation'
        }
      },
      {
        id: 'EB-2',
        title: 'Microphone (5 units) - Jane Dee',
        start: '2025-11-05',
        end: '2025-11-07',
        type: 'equipment',
        status: 'OVERDUE',
        backgroundColor: '#ef4444',
        borderColor: '#dc2626',
        extendedProps: {
          userName: 'Jane Dee',
          userEmail: 'jane@example.com',
          quantity: 5,
          purpose: 'Culminating activity'
        }
      },
      {
        id: 'EB-3',
        title: 'Laptop (1 unit) - Defense',
        start: '2025-11-09',
        end: '2025-11-12',
        type: 'equipment',
        status: 'PENDING',
        backgroundColor: '#f59e0b',
        borderColor: '#d97706',
        extendedProps: {
          userName: 'John Doe',
          userEmail: 'john@example.com',
          quantity: 1,
          purpose: 'Defense'
        }
      }
    ];

    this.events = sampleEvents;
    this.updateCalendarEvents();
  }

  updateCalendarEvents(): void {
    let filteredEvents = this.events;

    // Filter by type
    if (this.filterType !== 'all') {
      filteredEvents = filteredEvents.filter(event => event.type === this.filterType);
    }

    // Filter by status
    if (this.filterStatus !== 'all') {
      filteredEvents = filteredEvents.filter(event => event.status === this.filterStatus);
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
    // You can implement create new reservation/borrowing here
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
    if (this.selectedEvent) {
      console.log('Approving event:', this.selectedEvent.id);
      // TODO: Call backend API to approve
      // After success, update the event status and color
      this.selectedEvent.status = 'APPROVED';
      this.selectedEvent.backgroundColor = '#10b981';
      this.selectedEvent.borderColor = '#059669';
      this.updateCalendarEvents();
      this.closeModal();
    }
  }

  rejectEvent(): void {
    if (this.selectedEvent) {
      console.log('Rejecting event:', this.selectedEvent.id);
      // TODO: Call backend API to reject
      this.selectedEvent.status = 'REJECTED';
      this.selectedEvent.backgroundColor = '#ef4444';
      this.selectedEvent.borderColor = '#dc2626';
      this.updateCalendarEvents();
      this.closeModal();
    }
  }

  deleteEvent(): void {
    if (this.selectedEvent) {
      console.log('Deleting event:', this.selectedEvent.id);
      // TODO: Call backend API to delete
      this.events = this.events.filter(e => e.id !== this.selectedEvent?.id);
      this.updateCalendarEvents();
      this.closeModal();
    }
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