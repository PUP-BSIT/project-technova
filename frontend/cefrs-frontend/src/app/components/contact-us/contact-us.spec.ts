import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactUs } from './contact-us';
import { provideHttpClient } from '@angular/common/http';

describe('ContactUs', () => {
  let component: ContactUs;
  let fixture: ComponentFixture<ContactUs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
        imports: [ContactUs],
        providers: [provideHttpClient()]
      })
    .compileComponents();

    fixture = TestBed.createComponent(ContactUs);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
