import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentDashboard } from './student-dashboard';
import { provideHttpClient } from '@angular/common/http';

describe('StudentDashboard', () => {
  let component: StudentDashboard;
  let fixture: ComponentFixture<StudentDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentDashboard],
      providers: [provideHttpClient()]
    })
      .compileComponents();

    fixture = TestBed.createComponent(StudentDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});