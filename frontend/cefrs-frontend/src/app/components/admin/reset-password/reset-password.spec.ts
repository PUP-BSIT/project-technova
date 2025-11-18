import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { ResetPassword } from './reset-password';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

describe('ResetPassword', () => {
  let component: ResetPassword;
  let fixture: ComponentFixture<ResetPassword>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ResetPassword,
        HttpClientTestingModule,
        RouterTestingModule
      ],
      providers: [provideHttpClient()]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ResetPassword);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
