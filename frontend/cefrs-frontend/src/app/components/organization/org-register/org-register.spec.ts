import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrgRegisterComponent } from './org-register';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

describe('OrgRegister', () => {
  let component: OrgRegisterComponent;
  let fixture: ComponentFixture<OrgRegisterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrgRegisterComponent],
      providers: [
        provideHttpClient(),
        provideRouter([])
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(OrgRegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});