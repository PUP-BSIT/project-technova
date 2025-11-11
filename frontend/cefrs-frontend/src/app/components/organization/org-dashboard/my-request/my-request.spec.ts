import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { OrgMyRequestComponent } from './my-request';

describe('OrgMyRequestComponent', () => {
  let component: OrgMyRequestComponent;
  let fixture: ComponentFixture<OrgMyRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrgMyRequestComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrgMyRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
