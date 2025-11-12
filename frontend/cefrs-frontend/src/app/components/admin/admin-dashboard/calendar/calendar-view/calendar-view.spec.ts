import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CalendarView } from './calendar-view';
import { CalendarService } from '../../../../../services/calendar.service';
import { AuthService } from '../../../../../services/auth';

describe('CalendarView', () => {
  let component: CalendarView;
  let fixture: ComponentFixture<CalendarView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CalendarView,
        HttpClientTestingModule
      ],
      providers: [
        CalendarService,
        AuthService
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(CalendarView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});