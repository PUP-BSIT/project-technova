import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';

import { MyRequests } from './my-requests';

describe('MyRequests', () => {
  let component: MyRequests;
  let fixture: ComponentFixture<MyRequests>;

  beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [MyRequests],
        providers: [
          provideHttpClient()
        ]
      })
      .compileComponents();

    fixture = TestBed.createComponent(MyRequests);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
