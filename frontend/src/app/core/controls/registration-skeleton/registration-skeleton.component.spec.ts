import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrationSkeletonComponent } from './registration-skeleton.component';

 describe('RegistrationSkeletonComponent', () => {
  let component: RegistrationSkeletonComponent;
  let fixture: ComponentFixture<RegistrationSkeletonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistrationSkeletonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RegistrationSkeletonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
