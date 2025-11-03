import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportLogs } from './report-logs';

describe('ReportLogs', () => {
  let component: ReportLogs;
  let fixture: ComponentFixture<ReportLogs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportLogs]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportLogs);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
