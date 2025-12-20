import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrgContactUs } from './org-contact-us';
import { provideHttpClient } from '@angular/common/http';

describe('OrgContactUs', () => {
  let component: OrgContactUs;
  let fixture: ComponentFixture<OrgContactUs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
        imports: [OrgContactUs],
        providers: [provideHttpClient()]
      })
    .compileComponents();

    fixture = TestBed.createComponent(OrgContactUs);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
