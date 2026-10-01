import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MainSchedulerComponent } from './main-scheduler.component';
import { AccountsModule } from '../accounts.module';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('MainSchedulerComponent', () => {
  let component: MainSchedulerComponent;
  let fixture: ComponentFixture<MainSchedulerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountsModule],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(MainSchedulerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
