import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrgSidebarComponent } from './org-sidebar';

describe('OrgSidebarComponent', () => {
  let component: OrgSidebarComponent;
  let fixture: ComponentFixture<OrgSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrgSidebarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrgSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
