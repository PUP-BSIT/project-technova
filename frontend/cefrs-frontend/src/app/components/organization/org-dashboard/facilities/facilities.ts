import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Facility {
  id: string;
  name: string;
  location: string;
  description: string;
  capacity: number;
  image: string;
  status: 'Available' | 'Reserved';
}

@Component({
  selector: 'app-org-facilities',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './facilities.html',
  styleUrls: ['./facilities.scss']
})
export class OrgFacilitiesComponent implements OnInit {
  searchQuery = '';

  facilities: Facility[] = [
    { id: '1', name: '4th Floor, Engr. AVR', location: '4th Floor, Engineering Building', description: 'Modern auditorium perfect for conferences and presentations with state-of-the-art AV equipment', capacity: 100, image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400', status: 'Available' },
    { id: '2', name: 'NCRPO AVR, Building B', location: 'NCRPO Building B', description: 'Versatile AVR space ideal for workshops, seminars, and corporate events', capacity: 60, image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400', status: 'Reserved' },
    { id: '3', name: 'Quadrangle, Building A', location: 'Building A Quadrangle', description: 'Open-air quadrangle perfect for outdoor events, ceremonies, and large gatherings', capacity: 150, image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=400', status: 'Available' }
  ];

  ngOnInit(): void {
    // Load facilities data if needed
  }

  // filter facilities
  get filteredFacilities(): Facility[] {
    if (!this.searchQuery.trim()) {
      return this.facilities;
    }

    const query = this.searchQuery.toLowerCase();
    return this.facilities.filter(facility =>
      facility.name.toLowerCase().includes(query) ||
      facility.location.toLowerCase().includes(query) ||
      facility.description.toLowerCase().includes(query)
    );
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      Available: 'status-available',
      Reserved: 'status-reserved'
    };
    return map[status] || '';
  }
}