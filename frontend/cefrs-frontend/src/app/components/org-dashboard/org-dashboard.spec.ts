import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrgDashboard } from './org-dashboard';

describe('OrgDashboard', () => {
  let component: OrgDashboard;
  let fixture: ComponentFixture<OrgDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrgDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrgDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
