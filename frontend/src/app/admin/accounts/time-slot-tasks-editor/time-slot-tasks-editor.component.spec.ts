import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeSlotTasksEditorComponent } from './time-slot-tasks-editor.component';
import { AccountsModule } from '../accounts.module';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('TimeSlotTasksEditorComponent', () => {
  let component: TimeSlotTasksEditorComponent;
  let fixture: ComponentFixture<TimeSlotTasksEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountsModule],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(TimeSlotTasksEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
