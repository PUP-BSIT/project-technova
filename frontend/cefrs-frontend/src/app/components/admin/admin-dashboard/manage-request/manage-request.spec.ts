import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageRequest } from './manage-request';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('ManageRequest', () => {
  let component: ManageRequest;
  let fixture: ComponentFixture<ManageRequest>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageRequest],
      providers: [provideHttpClientTesting()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageRequest);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
