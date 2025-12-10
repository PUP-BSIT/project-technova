import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForgotPassword } from './forgot-password';
import { provideHttpClient } from '@angular/common/http';

describe('ForgotPassword', () => {
  let component: ForgotPassword;
  let fixture: ComponentFixture<ForgotPassword>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
            imports: [ForgotPassword],
            providers: [provideHttpClient()]
          })
    .compileComponents();

    fixture = TestBed.createComponent(ForgotPassword);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
