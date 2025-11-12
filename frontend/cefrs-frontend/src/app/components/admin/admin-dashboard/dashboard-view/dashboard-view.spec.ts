import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { DashboardView } from './dashboard-view';
import { ReportService } from '../../../../services/report.service';
import { CalendarService } from '../../../../services/calendar.service';
import { AuthService } from '../../../../services/auth';

describe('DashboardView', () => {
  let component: DashboardView;
  let fixture: ComponentFixture<DashboardView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        DashboardView,
        HttpClientTestingModule,
        RouterTestingModule
      ],
      providers: [
        ReportService,
        CalendarService,
        AuthService
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(DashboardView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});