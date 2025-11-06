import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrgMyRequestComponent } from './my-request';

describe('OrgMyRequestComponent', () => {
  let component: OrgMyRequestComponent;
  let fixture: ComponentFixture<OrgMyRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrgMyRequestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrgMyRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

