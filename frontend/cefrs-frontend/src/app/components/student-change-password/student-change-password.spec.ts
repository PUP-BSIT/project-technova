import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentChangePasswordComponent } from './student-change-password';
import { provideHttpClient } from '@angular/common/http';

describe('StudentChangePassword', () => {
  let component: StudentChangePasswordComponent;
  let fixture: ComponentFixture<StudentChangePasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentChangePasswordComponent],
      providers: [provideHttpClient()]
    })
      .compileComponents();

    fixture = TestBed.createComponent(StudentChangePasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
