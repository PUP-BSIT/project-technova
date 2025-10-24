import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentChangePassword } from './student-change-password';

describe('StudentChangePassword', () => {
  let component: StudentChangePassword;
  let fixture: ComponentFixture<StudentChangePassword>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentChangePassword]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentChangePassword);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
