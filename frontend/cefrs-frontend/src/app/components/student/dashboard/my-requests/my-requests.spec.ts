import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyRequests } from './my-requests';

describe('MyRequests', () => {
  let component: MyRequests;
  let fixture: ComponentFixture<MyRequests>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyRequests]
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
