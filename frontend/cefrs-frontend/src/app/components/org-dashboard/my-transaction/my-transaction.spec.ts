import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrgMyTransactionComponent } from './my-transaction';

describe('OrgMyTransactionComponent', () => {
  let component: OrgMyTransactionComponent;
  let fixture: ComponentFixture<OrgMyTransactionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrgMyTransactionComponent]
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

