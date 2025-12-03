import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminDashboard } from './admin-dashboard';
import { provideHttpClient } from '@angular/common/http';

describe('AdminDashboard', () => {
  let component: AdminDashboard;
  let fixture: ComponentFixture<AdminDashboard>;

  beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [AdminDashboard],
        providers: [provideHttpClient()]
      })
    .compileComponents();

    fixture = TestBed.createComponent(AdminDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
