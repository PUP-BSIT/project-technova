import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyTransaction } from './my-transaction';

describe('MyTransaction', () => {
  let component: MyTransaction;
  let fixture: ComponentFixture<MyTransaction>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyTransaction]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyTransaction);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
