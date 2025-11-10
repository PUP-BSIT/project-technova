import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Equipment } from './equipment';

describe('Equipment', () => {
  let component: Equipment;
  let fixture: ComponentFixture<Equipment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Equipment]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Equipment);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
