import { Component, OnInit, AfterViewInit, HostListener } from '@angular/core';
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
  showLoginMenu = false;
  showSignupMenu = false;

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

  toggleLoginMenu(event: Event): void {
    event.stopPropagation();
    this.showLoginMenu = !this.showLoginMenu;
    if (this.showLoginMenu) {
      this.showSignupMenu = false;
    }
  }

  toggleSignupMenu(event: Event): void {
    event.stopPropagation();
    this.showSignupMenu = !this.showSignupMenu;
    if (this.showSignupMenu) {
      this.showLoginMenu = false;
    }
  }

  @HostListener('document:click')
  closeMenus(): void {
    this.showLoginMenu = false;
    this.showSignupMenu = false;
  }

  goToStudentLogin() {
    this.router.navigate(['/login'], { queryParams: { role: 'STUDENT' } });
    this.closeMenus();
  }

  goToOrgLogin() {
    this.router.navigate(['/org-login']);
    this.closeMenus();
  }

  goToAdminLogin() {
    this.router.navigate(['/admin-login']);
  }

  goToStudentRegister() {
    this.router.navigate(['/register']);
    this.closeMenus();
  }

  goToRoleSelection() {
    this.router.navigate(['/select-role']);
    this.closeMenus();
  }

  goToOrgRegister() {
    this.router.navigate(['/org-register']);
    this.closeMenus();
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