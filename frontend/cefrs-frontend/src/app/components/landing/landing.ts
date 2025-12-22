import { Component, OnInit, AfterViewInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './landing.html',
  styleUrls: ['./landing.scss']
})
export class LandingComponent implements OnInit, AfterViewInit, OnDestroy {
  showLoginMenu = false;
  showSignupMenu = false;
  showMobileMenu = false;

  constructor(private router: Router) {}

  ngOnDestroy(): void {
    // Cleanup: restore body scroll
    document.body.style.overflow = '';
  }

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
      '.hero-content, .overview-card, .feature-card, .policy-item, .section-title, .section-subtitle'
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

  @HostListener('document:click', ['$event'])
  closeMenus(event?: Event): void {
    if (event) {
      const target = event.target as HTMLElement;
      // Don't close if clicking inside dropdown menus, mobile menu, or mobile toggle button
      if (target.closest('.nav-signup-menu') || 
          target.closest('.nav-login-menu') || 
          target.closest('.nav-menu') ||
          target.closest('.mobile-menu-toggle') ||
          target.closest('.mobile-overlay')) {
        return;
      }
    }
    this.showLoginMenu = false;
    this.showSignupMenu = false;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    // Close mobile menu on resize to desktop size
    if (window.innerWidth > 768 && this.showMobileMenu) {
      this.closeMobileMenu();
    }
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: Event): void {
    if (this.showMobileMenu) {
      this.closeMobileMenu();
    }
  }

  toggleMobileMenu(): void {
    this.showMobileMenu = !this.showMobileMenu;
    // Prevent body scroll when mobile menu is open
    if (this.showMobileMenu) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  closeMobileMenu(): void {
    this.showMobileMenu = false;
    document.body.style.overflow = '';
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
    this.router.navigate(['/register'], { queryParams: { role: 'STUDENT' } });
    this.closeMenus();
  }

  goToRoleSelection() {
    this.router.navigate(['/select-role']);
    this.closeMenus();
  }

  goToOrgRegister() {
    this.router.navigate(['/org-register'], { queryParams: { role: 'CAMPUS_ORGANIZATION' } });
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

  goToContactUs() {
    this.router.navigate(['/contact-us']);
    this.closeMenus();
  }
}