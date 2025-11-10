import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrgProfileComponent } from './org-profile';
import { provideHttpClient } from '@angular/common/http';

describe('OrgProfile', () => {
  let component: OrgProfileComponent;
  let fixture: ComponentFixture<OrgProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrgProfileComponent],
      providers: [provideHttpClient()]
    })
      .compileComponents();

    fixture = TestBed.createComponent(OrgProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
