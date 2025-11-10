import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrgChangePasswordComponent } from './org-change-password';
import { provideHttpClient } from '@angular/common/http';

describe('OrgChangePassword', () => {
  let component: OrgChangePasswordComponent;
  let fixture: ComponentFixture<OrgChangePasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrgChangePasswordComponent],
      providers: [provideHttpClient()]
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
