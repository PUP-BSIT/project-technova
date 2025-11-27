import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { LandingComponent } from './landing';
import { RouterTestingModule } from '@angular/router/testing';


describe('LandingComponent', () => {
  let component: LandingComponent;
  let fixture: ComponentFixture<LandingComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingComponent, RouterTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(LandingComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to student login when goToStudentLogin is called', () => {
    const navigateSpy = spyOn(router, 'navigate');
    component.goToStudentLogin();
    expect(navigateSpy).toHaveBeenCalledWith(['/login'], { queryParams: { role: 'STUDENT' } });
  });

  it('should navigate to organization login when goToOrgLogin is called', () => {
    const navigateSpy = spyOn(router, 'navigate');
    component.goToOrgLogin();
    expect(navigateSpy).toHaveBeenCalledWith(['/org-login']);
  });

  it('should navigate to student register when goToStudentRegister is called', () => {
    const navigateSpy = spyOn(router, 'navigate');
    component.goToStudentRegister();
    expect(navigateSpy).toHaveBeenCalledWith(['/register']);
  });

  it('should navigate to organization register when goToOrgRegister is called', () => {
    const navigateSpy = spyOn(router, 'navigate');
    component.goToOrgRegister();
    expect(navigateSpy).toHaveBeenCalledWith(['/org-register']);
  });

  it('should render the hero title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const heroTitle = compiled.querySelector('.hero-title');
    expect(heroTitle).toBeTruthy();
    expect(heroTitle?.textContent).toContain('Campus Equipment & Facility');
  });

  it('should render the features section', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const featuresSection = compiled.querySelector('.features');
    expect(featuresSection).toBeTruthy();
  });

  it('should render all feature cards', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const featureCards = compiled.querySelectorAll('.feature-card');
    expect(featureCards.length).toBe(6);
  });

  it('should render navigation bar', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const navbar = compiled.querySelector('.navbar');
    expect(navbar).toBeTruthy();
  });

  it('should render footer', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const footer = compiled.querySelector('.footer');
    expect(footer).toBeTruthy();
  });

  it('should render Signup and Login controls in navbar', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const signupBtn = compiled.querySelector('.navbar .nav-signup-menu .btn-nav-secondary');
    const loginBtn = compiled.querySelector('.navbar .btn-nav-login');

    expect(signupBtn).toBeTruthy();
    expect(signupBtn?.textContent?.includes('Sign Up')).toBeTrue();
    expect(loginBtn).toBeTruthy();
    expect(loginBtn?.textContent?.includes('Log In')).toBeTrue();
  });

  it('should have navigation links in navbar', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const navLinks = compiled.querySelectorAll('.navbar .nav-link');
    expect(navLinks.length).toBeGreaterThan(0);
    expect(navLinks.length).toBe(4); // Overview, Features, Policies, Contact
  });

  it('should have primary action buttons in hero section', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const heroActions = compiled.querySelectorAll('.hero-actions button');
    expect(heroActions.length).toBeGreaterThan(0);
    expect(heroActions.length).toBe(2);
  });
});