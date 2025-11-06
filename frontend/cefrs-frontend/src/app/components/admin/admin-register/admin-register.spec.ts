import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminRegister } from './admin-register';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

describe('AdminRegister', () => {
  let component: AdminRegister;
  let fixture: ComponentFixture<AdminRegister>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminRegister],
      providers: [
        provideHttpClient(),
        provideRouter([])
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminRegister);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});


