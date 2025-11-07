import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarView } from './calendar-view';

describe('CalendarView', () => {
  let component: CalendarView;
  let fixture: ComponentFixture<CalendarView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarView]
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
