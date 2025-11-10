import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { StudentSidebarComponent } from './student-sidebar';

describe('StudentSidebar', () => {
  let component: StudentSidebarComponent;
  let fixture: ComponentFixture<StudentSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentSidebarComponent, RouterTestingModule],
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
