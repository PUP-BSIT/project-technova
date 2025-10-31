import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrgDashboardComponent } from './org-dashboard';

describe('OrgDashboard', () => {
  let component: OrgDashboardComponent;
  let fixture: ComponentFixture<OrgDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrgDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrgDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
