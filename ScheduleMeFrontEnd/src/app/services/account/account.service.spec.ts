import {
  HttpClient,
  HttpEventType,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { Observable } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AccountService } from './account.service';
import { accountApiInterceptor } from './account-api.interceptor';
import { jwtInterceptor } from '../../core/helpers/jwt.interceptor';
import { provideApi } from '../../shared/openapi-api-client/provide-api';
import { environment } from '../../../environments/environment';
import { Account, Role } from '../../entities';
import { Schedule } from '../../entities/schedule';
import { Task } from '../../entities/task';
import { TimeSlotsTasksDTO } from '../../entities/timeslotstasksDTO';
import { AgentTaskConfig } from '../../entities/agenttaskconfig';

// Exercise the real generated service, rather than mocking its method names.
describe('AccountService generated API wrapper', () => {
  let service: AccountService;
  let http: HttpTestingController;
  const navigate = vi.fn().mockResolvedValue(true);
  const apiUrl = `${environment.apiUrl}/Accounts`;

  function accountResponse() {
    const payload = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }));
    return {
      id: 'account-1',
      email: 'user@example.test',
      dob: '2000-01-01',
      role: Role.Admin,
      jwtToken: `${btoa('{}')}.${payload}.signature`,
    };
  }

  function login() {
    const account = accountResponse();
    service.login(account.email, 'password', account.dob).subscribe();
    http.expectOne(`${apiUrl}/authenticate`).flush(account);
    return account;
  }

  beforeEach(() => {
    vi.useFakeTimers();
    navigate.mockClear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([accountApiInterceptor, jwtInterceptor])),
        provideHttpClientTesting(),
        provideApi({ basePath: environment.apiUrl }),
        { provide: Router, useValue: { navigate } },
        { provide: CookieService, useValue: { getAll: () => ({}) } },
      ],
    });
    service = TestBed.inject(AccountService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    try {
      http.verify();
    } finally {
      vi.clearAllTimers();
      vi.useRealTimers();
      TestBed.resetTestingModule();
    }
  });

  it('authenticates with cookies, publishes the account, and refreshes before expiry', () => {
    const account = accountResponse();
    const states: Array<Account | null> = [];
    const subscription = service.account.subscribe((value) => states.push(value));
    service.login(account.email, 'password', account.dob).subscribe((value) => {
      expect(value).toEqual(account);
    });
    const request = http.expectOne(`${apiUrl}/authenticate`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      email: account.email,
      password: 'password',
      dob: account.dob,
    });
    expect(request.request.withCredentials).toBe(true);
    request.flush(account);
    expect(service.accountValue).toEqual(account);
    expect(service.isAdmin()).toBe(true);
    expect(states).toEqual([null, account]);

    vi.advanceTimersByTime(3540_000);
    const refresh = http.expectOne(`${apiUrl}/refresh-token`);
    expect(refresh.request.withCredentials).toBe(true);
    expect(refresh.request.headers.get('Authorization')).toBe(`Bearer ${account.jwtToken}`);
    const refreshed = accountResponse();
    refresh.flush(refreshed);
    expect(service.accountValue).toEqual(refreshed);
    subscription.unsubscribe();
  });

  it('revokes with cookies, clears state, redirects, and cancels refresh on logout', () => {
    login();
    service.logout();
    const request = http.expectOne(`${apiUrl}/revoke-token`);
    expect(request.request.withCredentials).toBe(true);
    expect(request.request.body).toEqual({});
    request.flush({});
    expect(service.accountValue).toBeNull();
    expect(navigate).toHaveBeenCalledWith(['/account/login']);
    vi.advanceTimersByTime(3600_000);
    http.expectNone(`${apiUrl}/refresh-token`);
  });

  it('keeps JWT authorization but does not enable cookies on ordinary API requests', () => {
    const account = login();
    service.getAll().subscribe();
    const request = http.expectOne(apiUrl);
    expect(request.request.headers.get('Authorization')).toBe(`Bearer ${account.jwtToken}`);
    expect(request.request.withCredentials).toBe(false);
    request.flush([account]);
  });

  it('preserves registration fields and serializes dates', () => {
    const dob = new Date('2000-01-01T00:00:00Z');
    const ts = new Date('2026-01-01T00:00:00Z');
    const account = {
      email: 'user@example.test',
      password: 'password',
      confirmPassword: 'password',
      firstName: 'First',
      lastName: 'Last',
      title: 'Ms',
      dob,
      ts,
      phoneNumber: '+61400000000',
      enableMfa: true,
    };
    service.register(account).subscribe();
    const request = http.expectOne(`${apiUrl}/register`);
    expect(request.request.body).toEqual({ ...account, dob: dob.toJSON() });
    expect(request.request.withCredentials).toBe(false);
    request.flush({});
  });

  it('uses the email-verification route declared by the controller and specification', () => {
    service.verifyEmail('token', '2000-01-01').subscribe();
    const request = http.expectOne(`${apiUrl}/verify-`);
    expect(request.request.body).toEqual({ token: 'token', dob: '2000-01-01' });
    request.flush({});
  });

  it('returns the downloaded file as a Blob rather than parsing JSON', () => {
    let result: Blob | undefined;
    service.downloadSchedulesFile().subscribe((value) => (result = value));
    const request = http.expectOne(`${apiUrl}/download-schedules-file`);
    expect(request.request.responseType).toBe('blob');
    const file = new Blob(['schedule data'], { type: 'application/octet-stream' });
    request.flush(file);
    expect(result).toBe(file);
  });

  it.each(['accounts', 'timeslots'] as const)(
    'preserves multipart %s uploads and progress events',
    (kind) => {
      const formData = new FormData();
      formData.append('file', new Blob(['data']), 'input.csv');
      const events: HttpEventType[] = [];
      const result =
        kind === 'accounts'
          ? service.uploadAccountsFile(formData)
          : service.uploadTimeSlotsFile(formData);
      result.subscribe((event) => events.push(event.type));
      const request = http.expectOne(`${apiUrl}/upload-${kind}`);
      expect(request.request.method).toBe('POST');
      expect(request.request.body).toBe(formData);
      expect(request.request.headers.has('Content-Type')).toBe(false);
      expect(request.request.reportProgress).toBe(true);
      request.event({ type: HttpEventType.UploadProgress, loaded: 2, total: 4 });
      request.flush([]);
      expect(events).toContain(HttpEventType.UploadProgress);
      expect(events).toContain(HttpEventType.Response);
    },
  );

  it('merges updates into the current account without losing the JWT', () => {
    const account = login();
    service.update(account.id, { firstName: 'Changed' }).subscribe();
    http.expectOne(`${apiUrl}/${account.id}`).flush({ id: account.id, firstName: 'Changed' });
    expect(service.accountValue?.firstName).toBe('Changed');
    expect(service.accountValue?.jwtToken).toBe(account.jwtToken);
  });

  it('logs out when the current account is deleted', () => {
    const account = login();
    service.delete(account.id).subscribe();
    http.expectOne(`${apiUrl}/${account.id}`).flush({});
    http.expectOne(`${apiUrl}/revoke-token`).flush({});
    expect(service.accountValue).toBeNull();
    expect(navigate).toHaveBeenCalledWith(['/account/login']);
  });

  it('does not change unrelated HTTP requests', () => {
    TestBed.inject(HttpClient).get('/unrelated').subscribe();
    const request = http.expectOne('/unrelated');
    expect(request.request.responseType).toBe('json');
    expect(request.request.withCredentials).toBe(false);
    expect(request.request.headers.has('Authorization')).toBe(false);
    request.flush({});
  });

  const schedule = Object.assign(new Schedule(), { date: '2026-01-01', required: true });
  const task = Object.assign(new Task(), { userFunction: 'Reader' });
  const slots = Object.assign(new TimeSlotsTasksDTO(), { date: '2026-01-01', tasks: 'Reader' });
  const config = Object.assign(new AgentTaskConfig(), { agentTaskStr: 'Reader', isGroup: false });
  type RouteCase = [
    string,
    string,
    string,
    (service: AccountService) => Observable<unknown>,
    unknown?,
  ];
  const cases: RouteCase[] = [
    ['getAll', 'GET', '', (s) => s.getAll()],
    ['getById', 'GET', '/account-1', (s) => s.getById('account-1')],
    ['getAllDates', 'GET', '/all-dates', (s) => s.getAllDates()],
    [
      'getTeams',
      'GET',
      '/teams-for-date/2026-01-01',
      (s) => s.getTeamsByFunctionForDate('2026-01-01'),
    ],
    ['generateSchedules', 'POST', '/generate-schedules', (s) => s.generateSchedules()],
    ['getTimeSlots', 'GET', '/timeslots-tasks', (s) => s.getTimeSlotsTasks()],
    ['setTimeSlots', 'PUT', '/timeslots-tasks', (s) => s.setTimeSlotsTasks(slots), slots],
    ['deleteTimeSlots', 'POST', '/timeslots-tasks', (s) => s.deleteTimeSlotsTasks(slots), slots],
    [
      'getPoolForAccount',
      'GET',
      '/available_pool-elements-for-account/account-1',
      (s) => s.getAvailablePoolElementsForAccount('account-1'),
    ],
    ['getPool', 'GET', '/all-available-pool-elements', (s) => s.GetAllAvailablePoolElements()],
    [
      'addSchedule',
      'PUT',
      '/add-schedule/account-1',
      (s) => s.addSchedule('account-1', schedule),
      schedule,
    ],
    [
      'updateSchedule',
      'POST',
      '/update-schedule/account-1',
      (s) => s.updateSchedule('account-1', schedule),
      schedule,
    ],
    [
      'deleteSchedule',
      'POST',
      '/delete-schedule/account-1',
      (s) => s.deleteSchedule('account-1', schedule),
      schedule,
    ],
    [
      'deleteSchedules4Date',
      'DELETE',
      '/delete-schedules_4_date/2026-01-01',
      (s) => s.deleteSchedules4Date('2026-01-01'),
    ],
    [
      'getSchedules4Date',
      'GET',
      '/get-schedule/2026-01-01',
      (s) => s.getSchedules4Date('2026-01-01'),
    ],
    [
      'addFunction',
      'PUT',
      '/add-function/account-1',
      (s) => s.addFunction('account-1', task),
      task,
    ],
    [
      'testAddFunction',
      'PUT',
      '/test-add-function/account-1',
      (s) => s.testAddFunction('account-1', task),
      task,
    ],
    [
      'deleteFunction',
      'POST',
      '/delete-function/account-1',
      (s) => s.deleteFunction('account-1', task),
      task,
    ],
    [
      'deletePoolElement',
      'POST',
      '/remove-pool-element/1/user%40example.test/Reader',
      (s) => s.deletePoolElement('1', 'user@example.test', 'Reader'),
    ],
    [
      'moveSchedule2Pool',
      'POST',
      '/move-schedule-to-pool/account-1',
      (s) => s.moveSchedule2Pool('account-1', schedule),
      schedule,
    ],
    [
      'getScheduleFromPool',
      'POST',
      '/get-schedule-from-pool/account-1',
      (s) => s.getScheduleFromPool('account-1', schedule),
      schedule,
    ],
    ['create', 'POST', '', (s) => s.create({ firstName: 'New' }), { firstName: 'New' }],
    ['deleteAllAccounts', 'DELETE', '/delete-all-user-accounts', (s) => s.deleteAllUserAccounts()],
    ['getAutoEmail', 'GET', '/auto-email', (s) => s.getAutoEmail()],
    ['setAutoEmail', 'PUT', '/auto-email', (s) => s.setAutoEmail(false), false],
    ['getConfigs', 'GET', '/get-all-agent-task-configs', (s) => s.getAllAgentTaskConfigs()],
    [
      'updateConfig',
      'PUT',
      '/create-agent-task-config/1',
      (s) => s.updateAgentTaskConfig('1', config),
      config,
    ],
    ['deleteConfig', 'DELETE', '/delete-agent-task-config/1', (s) => s.deleteAgentTaskConfig('1')],
    [
      'forgotPassword',
      'POST',
      '/forgot-password',
      (s) => s.forgotPassword({ email: 'user@example.test', dob: '2000-01-01' }),
      { email: 'user@example.test', dob: '2000-01-01' },
    ],
    [
      'validateResetToken',
      'POST',
      '/validate-reset-token',
      (s) => s.validateResetToken('token', '2000-01-01'),
      { token: 'token', dob: '2000-01-01' },
    ],
    [
      'resetPassword',
      'POST',
      '/reset-password',
      (s) =>
        s.resetPassword({
          token: 'token',
          password: 'pw',
          confirmPassword: 'pw',
          dob: '2000-01-01',
        }),
      { token: 'token', password: 'pw', confirmPassword: 'pw', dob: '2000-01-01' },
    ],
  ];

  it.each(cases)('delegates %s to the generated endpoint', (_name, method, path, invoke, body) => {
    invoke(service).subscribe();
    const request = http.expectOne(`${apiUrl}${path}`);
    expect(request.request.method).toBe(method);
    if (body !== undefined) expect(request.request.body).toEqual(body);
    expect(request.request.withCredentials).toBe(false);
    request.flush({ id: 'account-1' });
  });
});
