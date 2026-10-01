import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrationSkeletonComponent } from './registration-skeleton.component';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs/internal/observable/of';

describe('RegistrationSkeletonComponent', () => {
  let component: RegistrationSkeletonComponent;
  let fixture: ComponentFixture<RegistrationSkeletonComponent>;

  beforeEach(async () => {
    console.debug('Fixture created:');
    await TestBed.configureTestingModule({
      imports: [RegistrationSkeletonComponent],

      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            // Mock the snapshot
            snapshot: {
              paramMap: convertToParamMap({ id: '123' }),
            },
            // Mock the observable stream
            paramMap: of(convertToParamMap({ id: '123' })),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegistrationSkeletonComponent);

    console.debug('Fixture created:', fixture);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
