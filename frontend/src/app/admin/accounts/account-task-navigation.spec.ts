import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of, Subject } from 'rxjs';
import { Account, Role } from '../../entities';
import { AccountService, AlertService } from '../../services';
import { ManualRegistrationComponent } from './manual-registration/manual-registration.component';
import { FunctionComponent } from './function.component';

describe('Account task navigation', () => {
  it('renders the task editor when account and task requests complete asynchronously', async () => {
    const account = { ...new Account(), id: 'account-1', firstName: 'Mary', role: Role.User, isVerified: true };
    const accountResponse = new Subject<Account>();
    const taskResponse = new Subject<{ agentTaskStr: string; isGroup: boolean }[]>();
    await TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([{ path: 'accounts', loadChildren: () => import('./accounts.module').then((m) => m.AccountsModule) }]),
        { provide: AccountService, useValue: { getById: () => accountResponse, getAllAgentTaskConfigs: () => taskResponse, isAdmin: () => true } },
        { provide: AlertService, useValue: { clear: vi.fn(), error: vi.fn() } },
      ],
    }).compileComponents();

    const harness = await RouterTestingHarness.create();
    const component = await harness.navigateByUrl('/accounts/function/account-1', FunctionComponent);
    expect(harness.routeNativeElement?.textContent).toContain('Loading account tasks...');
    accountResponse.next(account);
    taskResponse.next([{ agentTaskStr: 'Greeter', isGroup: false }]);
    await harness.fixture.whenStable();

    expect(harness.routeNativeElement?.textContent).toContain('Choose Task for Mary');
    expect(component.dataSource.paginator).toBe(component.paginator);
    expect(component.dataSource.sort).toBe(component.sort);
    expect(component.paginator).toBeTruthy();
    expect(component.sort).toBeTruthy();
  });

  it.each(['account', 'tasks'])('displays an error if loading %s fails', async (failure) => {
    const account = { ...new Account(), id: 'account-1', role: Role.User };
    const accountResponse = new Subject<Account>();
    const taskResponse = new Subject<{ agentTaskStr: string; isGroup: boolean }[]>();
    const alertError = vi.fn();
    await TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([{ path: 'accounts', loadChildren: () => import('./accounts.module').then((m) => m.AccountsModule) }]),
        { provide: AccountService, useValue: { getById: () => accountResponse, getAllAgentTaskConfigs: () => taskResponse, isAdmin: () => true } },
        { provide: AlertService, useValue: { clear: vi.fn(), error: alertError } },
      ],
    }).compileComponents();

    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/accounts/function/account-1', FunctionComponent);
    const error = new Error('Request failed');
    if (failure === 'account') {
      accountResponse.error(error);
    } else {
      accountResponse.next(account);
      taskResponse.error(error);
    }
    await harness.fixture.whenStable();

    expect(alertError).toHaveBeenCalledWith(error);
    expect(harness.routeNativeElement?.querySelector('[role="alert"]')?.textContent).toContain('Unable to load account tasks.');
    expect(harness.routeNativeElement?.querySelector('a')?.getAttribute('href')).toBe('/accounts/add-edit/edit/account-1');
  });

  it('opens the selected account task editor', async () => {
    const task = { id: '1', userFunction: 'Greeter', preferredTime: '8:30', group: '', isGroup: false, highlighted: false, isDeleting: false };
    const account = { ...new Account(), id: 'account-1', firstName: 'Mary', role: Role.User, isVerified: true, userFunctions: [task] };
    const testAddFunction = vi.fn().mockReturnValue(of([]));
    const addFunction = vi.fn().mockReturnValue(of({ ...account, userFunctions: [{ ...task, id: '2', preferredTime: '14:45' }] }));
    await TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'accounts', loadChildren: () => import('./accounts.module').then((m) => m.AccountsModule) }]),
        { provide: AccountService, useValue: { getById: vi.fn().mockReturnValue(of(account)), getAllAgentTaskConfigs: vi.fn().mockReturnValue(of([{ agentTaskStr: 'Greeter', isGroup: false }])), isAdmin: () => true, testAddFunction, addFunction } },
        { provide: AlertService, useValue: { clear: vi.fn(), error: vi.fn() } },
      ],
    }).compileComponents();

    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/accounts/add-edit/edit/account-1', ManualRegistrationComponent);
    const button = Array.from(harness.routeNativeElement!.querySelectorAll('button')).find((item) => item.textContent?.trim() === 'Tasks')!;
    button.click();
    await harness.fixture.whenStable();
    harness.detectChanges();
    expect(harness.routeDebugElement?.componentInstance).toBeInstanceOf(FunctionComponent);
    expect(harness.routeNativeElement?.textContent).toContain('Choose Task for Mary');
    const time: HTMLInputElement = harness.routeNativeElement!.querySelector('input[type="time"]')!;
    (harness.routeNativeElement!.querySelector('mat-row') as HTMLElement).click();
    harness.detectChanges();
    expect(time.value).toBe('08:30');

    time.value = '14:45';
    time.dispatchEvent(new Event('input', { bubbles: true }));
    harness.detectChanges();
    harness.routeNativeElement!.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    expect(testAddFunction).toHaveBeenCalledWith('account-1', expect.objectContaining({ preferredTime: '14:45', userFunction: 'Greeter' }));
    expect(addFunction).toHaveBeenCalledWith('account-1', expect.objectContaining({ preferredTime: '14:45' }));

    (harness.routeNativeElement!.querySelector('a') as HTMLAnchorElement).click();
    await harness.fixture.whenStable();
    harness.detectChanges();
    expect(harness.routeDebugElement?.componentInstance).toBeInstanceOf(ManualRegistrationComponent);
  });
});
