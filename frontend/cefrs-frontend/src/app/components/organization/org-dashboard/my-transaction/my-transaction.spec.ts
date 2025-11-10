import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { OrgMyTransactionComponent } from './my-transaction';

describe('MyTransactionComponent', () => {
  let component: OrgMyTransactionComponent;
  let fixture: ComponentFixture<OrgMyTransactionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrgMyTransactionComponent],
      providers: [provideHttpClientTesting()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrgMyTransactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
