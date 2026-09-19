import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HonorificsComponent } from './honorifics.component';

describe('HonorificsTsComponent', () => {
  let component: HonorificsComponent;
  let fixture: ComponentFixture<HonorificsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HonorificsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HonorificsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
