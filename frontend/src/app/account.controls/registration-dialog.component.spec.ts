import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RegisterRequest } from '../dto/requests/register-request';
import { AccountService } from '../services';
import { RegisterDialogComponent } from './registration-dialog.component';

describe('RegisterDialogComponent string dates', () => {
  let fixture: ComponentFixture<RegisterDialogComponent>;
  let component: RegisterDialogComponent;
  let register: ReturnType<typeof vi.fn<(request: RegisterRequest) => ReturnType<typeof of>>>;
  const timestamp = '2026-09-22T13:30:00.123Z';

  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(timestamp));
    register = vi.fn().mockReturnValue(of({ message: 'Registration successful' }));
    await TestBed.configureTestingModule({
      imports: [RegisterDialogComponent],
      providers: [provideRouter([]), { provide: AccountService, useValue: { register } }],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterDialogComponent);
    component = fixture.componentInstance;
    component.payload = {
      salutation: 'Ms',
      first: 'First',
      last: 'Last',
      email: 'user@example.test',
      dob: '2000-09-22',
      phoneNumber: '+61400000000',
      password: 'password',
      confirmPassword: 'password',
      acceptTerms: true,
    };
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it.each([
    ['2000-09-22', '22-09-2000'],
    ['22-09-2000', '22-09-2000'],
    ['2000-02-29', '29-02-2000'],
    ['2000-01-01', '01-01-2000'],
  ])('sends DOB %s as %s and a UTC timestamp string', (dob, expected) => {
    component.payload.dob = dob;

    component.onRegister();

    expect(register).toHaveBeenCalledExactlyOnceWith({
      email: 'user@example.test',
      phoneNumber: '+61400000000',
      password: 'password',
      confirmPassword: 'password',
      firstName: 'First',
      lastName: 'Last',
      dob: expected,
      title: 'Ms',
      ts: timestamp,
      acceptTerms: true,
    } satisfies RegisterRequest);
    expect(component.errorMessage()).toBe('');
    expect(component.successMessage()).toContain('Registration successful');
    expect(component.loading).toBe(false);
  });

  it.each(['2026-02-31', '31-02-2026', 'not a date'])('rejects invalid DOB %s', (dob) => {
    component.payload.dob = dob;

    component.onRegister();

    expect(register).not.toHaveBeenCalled();
    expect(component.errorMessage()).toBe('Please provide a valid date of birth.');
    expect(component.loading).toBe(false);
  });

  it('requires a DOB before submitting', () => {
    component.payload.dob = '';

    component.onRegister();

    expect(register).not.toHaveBeenCalled();
    expect(component.errorMessage()).toBe('Please provide your date of birth.');
  });

  it('requires acceptance of terms before submitting', () => {
    component.payload.acceptTerms = false;

    component.onRegister();

    expect(register).not.toHaveBeenCalled();
    expect(component.errorMessage()).toBe('You must accept the terms.');
  });
});
