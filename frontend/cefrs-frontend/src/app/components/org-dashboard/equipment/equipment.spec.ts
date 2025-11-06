import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrgEquipmentComponent } from './equipment';

describe('OrgEquipmentComponent', () => {
  let component: OrgEquipmentComponent;
  let fixture: ComponentFixture<OrgEquipmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrgEquipmentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrgEquipmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

