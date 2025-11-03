import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminLogin } from './admin-login';

describe('AdminLogin', () => {
  let component: AdminLogin;
  let fixture: ComponentFixture<AdminLogin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminLogin]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminLogin);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
