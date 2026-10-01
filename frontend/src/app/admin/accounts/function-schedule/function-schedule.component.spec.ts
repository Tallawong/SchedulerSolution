import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FunctionScheduleComponent } from './function-schedule.component';
import { AccountsModule } from '../accounts.module';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('FunctionScheduleComponent', () => {
  let component: FunctionScheduleComponent;
  let fixture: ComponentFixture<FunctionScheduleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountsModule],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(FunctionScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
