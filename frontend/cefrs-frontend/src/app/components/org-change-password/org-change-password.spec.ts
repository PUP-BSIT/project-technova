import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrgChangePasswordComponent } from './org-change-password';

describe('OrgChangePassword', () => {
  let component: OrgChangePasswordComponent;
  let fixture: ComponentFixture<OrgChangePasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrgChangePasswordComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrgChangePasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
