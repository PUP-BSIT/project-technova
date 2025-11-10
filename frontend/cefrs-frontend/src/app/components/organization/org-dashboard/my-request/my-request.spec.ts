import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyRequest } from './my-request';

describe('MyRequest', () => {
  let component: MyRequest;
  let fixture: ComponentFixture<MyRequest>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyRequest]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyRequest);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
