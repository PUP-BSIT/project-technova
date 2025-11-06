import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Equipment {
  id: string;
  name: string;
  description: string;
  category: string;
  available: number;
  total: number;
  image: string;
}

@Component({
  selector: 'app-org-equipment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './equipment.html',
  styleUrls: ['./equipment.scss']
})
export class OrgEquipmentComponent implements OnInit {
  searchQuery = '';
  selectedCategory = 'All Categories';

  equipment: Equipment[] = [
    { id: '1', name: 'Microphone', description: 'High-quality microphone system perfect for presentations', category: 'Audio', available: 5, total: 5, image: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400' },
    { id: '2', name: 'Speaker', description: 'Powerful portable speaker system for events and presentations', category: 'Audio', available: 3, total: 3, image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400' },
    { id: '3', name: 'Folding Tables', description: 'Folding tables perfect for events and meetings', category: 'Furniture', available: 10, total: 10, image: 'https://images.unsplash.com/photo-1617325247661-675ab4b64ae2?w=400' },
    { id: '4', name: 'Stackable Chairs', description: 'Comfortable stackable chairs for events and meetings', category: 'Furniture', available: 50, total: 50, image: 'https://images.unsplash.com/photo-1503602642458-232111445657?w=400' },
    { id: '5', name: 'Projector', description: 'For displaying presentations, videos, and other visual content.', category: 'Visual', available: 5, total: 5, image: 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=400' },
    { id: '6', name: 'LED Par Light', description: 'Crucial for creating the right atmosphere and mood.', category: 'Lights', available: 5, total: 5, image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400' }
  ];

  ngOnInit(): void {
    // Load equipment data if needed
  }

  get filteredEquipment(): Equipment[] {
    let filtered = this.equipment;

    // Filter by search query
    if (this.searchQuery) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (this.selectedCategory !== 'All Categories') {
      filtered = filtered.filter(item => item.category === this.selectedCategory);
    }

    return filtered;
  }
}

