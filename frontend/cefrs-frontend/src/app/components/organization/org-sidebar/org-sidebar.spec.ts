import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { OrgSidebarComponent } from './org-sidebar';

describe('OrgSidebarComponent', () => {
  let component: OrgSidebarComponent;
  let fixture: ComponentFixture<OrgSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrgSidebarComponent, RouterTestingModule],
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
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
