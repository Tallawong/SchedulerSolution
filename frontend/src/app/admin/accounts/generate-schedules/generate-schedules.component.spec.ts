import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateSchedulesComponent } from './generate-schedules.component';
import { AccountsModule } from '../accounts.module';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('GenerateSchedulesComponent', () => {
  let component: GenerateSchedulesComponent;
  let fixture: ComponentFixture<GenerateSchedulesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountsModule],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(GenerateSchedulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
