import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentContactUs } from './student-contact-us';
import { provideHttpClient } from '@angular/common/http';

describe('StudentContactUs', () => {
  let component: StudentContactUs;
  let fixture: ComponentFixture<StudentContactUs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
        imports: [StudentContactUs],
        providers: [provideHttpClient()]
      })
    .compileComponents();

    fixture = TestBed.createComponent(StudentContactUs);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
