import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Facilities } from './facilities';

describe('Facilities', () => {
  let component: Facilities;
  let fixture: ComponentFixture<Facilities>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        Facilities,
        HttpClientTestingModule
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(Facilities);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});