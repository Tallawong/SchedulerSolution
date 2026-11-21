import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FloatingSchedulesComponent } from './floating-schedules.component';
import * as signalR from '@microsoft/signalr';
import { AlertService } from '../services';
describe('FloatingSchedulesComponent', () => {
  let component: FloatingSchedulesComponent;
  let fixture: ComponentFixture<FloatingSchedulesComponent>;
  let http: HttpTestingController;

  beforeEach(async () => {
    vi.spyOn(signalR.HubConnection.prototype, 'start').mockResolvedValue();
    vi.spyOn(signalR.HubConnection.prototype, 'stop').mockResolvedValue();
    await TestBed.configureTestingModule({
      declarations: [FloatingSchedulesComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(FloatingSchedulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    http.verify();
    fixture.destroy();
    vi.restoreAllMocks();
  });

  it('should create', () => {
    http.expectOne((request) => request.url.endsWith('/Accounts/all-available-pool-elements'))
      .flush({ schedulePoolElements: [] });
    expect(component).toBeTruthy();
  });

  it('loads floating schedules from the API', () => {
    const schedule = {
      id: 'schedule-1',
      email: 'person@example.test',
      date: '01-01-2030 09:00',
      userFunction: 'Greeter',
      scheduleGroup: 'A',
      required: true,
      userAvailability: true,
      deleting: false,
    };
    const request = http.expectOne((item) => item.url.endsWith('/Accounts/all-available-pool-elements'));
    expect(request.request.method).toBe('GET');
    request.flush({ schedulePoolElements: [schedule] });

    expect(component.isLoaded).toBe(true);
    expect(component.poolElements).toEqual([schedule]);
  });

  it('reports an API error while the DOM environment is active', () => {
    const alertService = TestBed.inject(AlertService);
    const errorSpy = vi.spyOn(alertService, 'error');
    let message = '';
    const subscription = alertService.onAlert().subscribe((alert) => (message = alert.message));

    http.expectOne((request) => request.url.endsWith('/Accounts/all-available-pool-elements'))
      .flush({ message: 'Schedules unavailable' }, { status: 500, statusText: 'Server Error' });

    expect(errorSpy).toHaveBeenCalledOnce();
    expect(errorSpy.mock.calls[0][0]).toBeInstanceOf(HttpErrorResponse);
    expect(message).toBe('Schedules unavailable');
    expect(component.isLoaded).toBe(false);
    subscription.unsubscribe();
  });
});
