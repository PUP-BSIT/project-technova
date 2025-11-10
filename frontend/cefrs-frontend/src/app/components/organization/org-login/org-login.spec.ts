import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrgLoginComponent } from './org-login';
import { provideHttpClient } from '@angular/common/http';

describe('OrgLoginComponent', () => {
  let component: OrgLoginComponent;
  let fixture: ComponentFixture<OrgLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrgLoginComponent],
      providers: [provideHttpClient()]
    }).compileComponents();

    fixture = TestBed.createComponent(OrgLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
