import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have default authentication state', () => {
    expect(typeof service.isLoggedIn()).toBe('boolean');
  });

  it('should return null when no token exists', () => {
    localStorage.removeItem('accessToken');
    expect(service.getToken()).toBeNull();
  });
});
