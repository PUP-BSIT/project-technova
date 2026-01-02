import { Component, OnInit, AfterViewInit, OnDestroy, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-contact-us',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, HttpClientModule],
  templateUrl: './contact-us.html',
  styleUrls: ['./contact-us.scss']
})
export class ContactUs implements OnInit, AfterViewInit, OnDestroy {
  contactForm: FormGroup;
  successMessage: string = '';
  errorMessage: string = '';
  showLoginMenu = false;
  showSignupMenu = false;
  showMobileMenu = false;
  loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient
  ) {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      message: ['', Validators.required]
    });
  }

  ngOnDestroy(): void {
    // Cleanup: restore body scroll
    document.body.style.overflow = '';
  }

  ngOnInit(): void {
    // Initialize component
  }

  ngAfterViewInit(): void {
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

  goToLanding(sectionId?: string, event?: Event) {
    if (event) {
      event.preventDefault();
    }
    if (sectionId) {
      this.router.navigate(['/'], { fragment: sectionId });
    } else {
      this.router.navigate(['/']);
    }
    this.closeMenus();
  }

  goToContactUs() {
    // Already on contact page, just close menu
    this.closeMenus();
  }

  onSubmit(): void {
    if (!this.contactForm.valid) {
      this.errorMessage = 'Please fill in all required fields correctly.';
      this.successMessage = '';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    const payload = this.contactForm.value;

    this.http.post<any>('/api/contact', payload).subscribe({
      next: (res) => {
        this.successMessage = res?.message || 'Message sent successfully!';
        this.errorMessage = '';
        this.contactForm.reset();
        setTimeout(() => this.successMessage = '', 3000);
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Failed to send message. Please try again later.';
        this.successMessage = '';
        this.loading = false;
      }
    });
  }
}