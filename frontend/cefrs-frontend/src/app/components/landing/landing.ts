import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './landing.html',
  styleUrls: ['./landing.scss']
})
export class LandingComponent implements OnInit, AfterViewInit {
  constructor(private router: Router) {}

  ngOnInit(): void {
    // Initialize scroll animations
  }

  ngAfterViewInit(): void {
    this.initScrollAnimations();
    this.initNavbarScroll();
  }

  initNavbarScroll(): void {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    let lastScroll = 0;
    window.addEventListener('scroll', () => {
      const currentScroll = window.pageYOffset;
      
      if (currentScroll > 100) {
        navbar.classList.add('navbar-scrolled');
      } else {
        navbar.classList.remove('navbar-scrolled');
      }
      
      lastScroll = currentScroll;
    });
  }

  initScrollAnimations(): void {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Observe all sections and cards
    const animatedElements = document.querySelectorAll(
      '.hero-content, .overview-card, .feature-card, .policy-item, .contact-card, .section-title, .section-subtitle'
    );

    animatedElements.forEach(el => {
      el.classList.add('scroll-animate');
      observer.observe(el);
    });
  }

  goToRoleSelection() {
    this.router.navigate(['/role-selection']);
  }

  goToStudentLogin() {
    this.router.navigate(['/login'], { queryParams: { role: 'STUDENT' } });
  }

  goToOrgLogin() {
    this.router.navigate(['/org-login']);
  }

  goToAdminLogin() {
    this.router.navigate(['/admin-login']);
  }

  scrollToFeatures() {
    this.scrollToSection('features');
  }

  scrollToSection(sectionId: string, event?: Event) {
    if (event) {
      event.preventDefault();
    }
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}

