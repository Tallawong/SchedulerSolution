import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadTimeslotsTasksComponent } from './upload-timeslots-tasks.component';
import { UploadTimeslotsTasksModule } from './upload-timeslots-tasks.module';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('AutoGeneratorComponent', () => {
  let component: UploadTimeslotsTasksComponent;
  let fixture: ComponentFixture<UploadTimeslotsTasksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadTimeslotsTasksModule],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(UploadTimeslotsTasksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
