import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrgFacilitiesComponent } from './facilities';

describe('OrgFacilitiesComponent', () => {
  let component: OrgFacilitiesComponent;
  let fixture: ComponentFixture<OrgFacilitiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrgFacilitiesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrgFacilitiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

