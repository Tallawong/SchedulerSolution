import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FirstLastComponent } from './first-last.component';

describe('FirstLastComponent', () => {
  let component: FirstLastComponent;
  let fixture: ComponentFixture<FirstLastComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FirstLastComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FirstLastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
