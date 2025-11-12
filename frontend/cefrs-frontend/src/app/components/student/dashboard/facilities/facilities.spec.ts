import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';

import { Facilities } from './facilities';

describe('Facilities', () => {
  let component: Facilities;
  let fixture: ComponentFixture<Facilities>;

  beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [Facilities],
        providers: [
          provideHttpClient()
        ]
      })
      .compileComponents();

    fixture = TestBed.createComponent(Facilities);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
