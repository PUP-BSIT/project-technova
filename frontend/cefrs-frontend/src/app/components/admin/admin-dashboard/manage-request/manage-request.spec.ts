import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageRequest } from './manage-request';
import { provideHttpClient } from '@angular/common/http';


describe('ManageRequest', () => {
  let component: ManageRequest;
  let fixture: ComponentFixture<ManageRequest>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageRequest],
      providers: [provideHttpClient()]
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
