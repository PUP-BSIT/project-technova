import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EquipmentInventory } from './equipment-inventory';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

describe('EquipmentInventory', () => {
  let component: EquipmentInventory;
  let fixture: ComponentFixture<EquipmentInventory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        EquipmentInventory,
        HttpClientTestingModule,
        RouterTestingModule
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(EquipmentInventory);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
