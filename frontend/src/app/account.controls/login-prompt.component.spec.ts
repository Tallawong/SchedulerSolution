import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { EMPTY, of, Subject, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MfaResponse } from '../dto/responses/mfa-response';
import { AccountService } from '../services';
import { AuthenticateResponse } from '../shared/openapi-api-client/model/authenticateResponse';
import { AccountModalService } from './account-modal.service';
import { LoginPromptComponent } from './login-prompt.component';

describe('LoginPromptComponent', () => {
  let fixture: ComponentFixture<LoginPromptComponent>;
  let component: LoginPromptComponent;
  let login: ReturnType<typeof vi.fn>;
  let verifyMfa: ReturnType<typeof vi.fn>;
  let navigate: ReturnType<typeof vi.fn>;
  let modalService: AccountModalService;

  beforeEach(async () => {
    login = vi.fn().mockReturnValue(EMPTY);
    verifyMfa = vi.fn().mockReturnValue(EMPTY);
    navigate = vi.fn().mockResolvedValue(true);
    await TestBed.configureTestingModule({
      imports: [LoginPromptComponent],
      providers: [
        { provide: AccountService, useValue: { login, verifyMfa } },
        { provide: Router, useValue: { navigate } },
      ],
    }).compileComponents();

    modalService = TestBed.inject(AccountModalService);
    vi.spyOn(modalService, 'hideLogin');
    fixture = TestBed.createComponent(LoginPromptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders login again after a successful login and route recreation', () => {
    const response: MfaResponse = { dob: '01-01-2000', mfaRequired: false, jwtToken: 'jwt' };
    login.mockReturnValue(of(response));

    for (let cycle = 0; cycle < 2; cycle++) {
      component.onSubmit();
      fixture.detectChanges();
      expect(component.visible).toBe(false);
      expect(fixture.nativeElement.querySelector('.lp-form')).toBeNull();
      fixture.destroy();

      fixture = TestBed.createComponent(LoginPromptComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.visible).toBe(true);
      expect(fixture.nativeElement.querySelector('.lp-form')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('button[type="submit"]').textContent).toContain('Sign in');
    }
  });

  it('continues to honor visibility changes while the login component is active', () => {
    modalService.hideLogin();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.lp-form')).toBeNull();

    modalService.showLogin();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.lp-form')).not.toBeNull();
  });

  it.each([
    ['2026-09-22', '22-09-2026'],
    ['2000-02-29', '29-02-2000'],
    ['2000-01-01', '01-01-2000'],
  ])('sends %s in the stored DOB format', (dob, expected) => {
    component.loginModel.set({ email: 'user@example.test', password: 'password', dob });

    component.onSubmit();

    expect(login).toHaveBeenCalledExactlyOnceWith('user@example.test', 'password', expected);
    expect(component.loading).toBe(false);
  });

  it('preserves the calendar date selected in the native input', async () => {
    component.loginModel.set({
      email: 'user@example.test',
      password: 'password',
      dob: '2000-01-01',
    });
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input[type="date"]');
    input.value = '2026-09-22';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.loginModel().dob).toBe('2026-09-22');
    component.onSubmit();

    expect(login).toHaveBeenCalledExactlyOnceWith('user@example.test', 'password', '22-09-2026');
  });

  it.each(['', 'not a date', '2026-02-31'])('rejects an invalid DOB: %s', (dob) => {
    component.loginModel.set({ email: 'user@example.test', password: 'password', dob });

    component.onSubmit();

    expect(login).not.toHaveBeenCalled();
    expect(component.errorMessage).toBe('Enter a valid date of birth.');
    expect(component.loading).toBe(false);
  });

  it('shows the MFA challenge for the submitted email without completing login', () => {
    const responses = new Subject<MfaResponse>();
    login.mockReturnValue(responses);
    component.loginModel.set({
      email: 'user@example.test', password: 'password', dob: '2000-01-01',
    });
    component.onSubmit();
    component.loginModel.update((model) => ({ ...model, email: 'changed@example.test' }));

    responses.next({ dob: null, mfaRequired: true, tempToken: 'temporary-token' });
    responses.complete();

    expect(component.showMfa).toBe(true);
    expect(component.mfaEmail).toBe('user@example.test');
    expect(navigate).not.toHaveBeenCalled();
    expect(modalService.hideLogin).not.toHaveBeenCalled();
    expect(component.loading).toBe(false);
  });

  it('completes non-MFA login using jwtToken rather than accessToken', () => {
    const response: MfaResponse = { dob: '01-01-2000', mfaRequired: false, jwtToken: 'jwt' };
    login.mockReturnValue(of(response));

    component.onSubmit();

    expect(modalService.hideLogin).toHaveBeenCalledOnce();
    expect(navigate).toHaveBeenCalledWith(['/profile']);
    expect(component.showMfa).toBe(false);
    expect(component.loading).toBe(false);
  });

  it('rejects a non-MFA login response without a JWT', () => {
    const response: MfaResponse = { dob: null, mfaRequired: false };
    login.mockReturnValue(of(response));

    component.onSubmit();

    expect(component.errorMessage).toBe('Unexpected login response');
    expect(navigate).not.toHaveBeenCalled();
    expect(modalService.hideLogin).not.toHaveBeenCalled();
    expect(component.loading).toBe(false);
  });

  it('accepts a plain AuthenticateResponse without an MFA discriminator', () => {
    const response: AuthenticateResponse = { dob: '01-01-2000', jwtToken: 'jwt' };
    login.mockReturnValue(of(response));

    component.onSubmit();

    expect(modalService.hideLogin).toHaveBeenCalledOnce();
    expect(navigate).toHaveBeenCalledWith(['/profile']);
    expect(component.showMfa).toBe(false);
  });

  it.each([
    null,
    'unexpected response',
    {},
    { jwtToken: 'jwt' },
    { dob: null, jwtToken: 123 },
    { dob: null, jwtToken: '   ' },
    { dob: null, jwtToken: 'jwt', mfaRequired: 'false' },
    { dob: null, jwtToken: 'jwt', mfaRequired: 'true' },
    { dob: null, jwtToken: 'jwt', role: 123 },
    { dob: null, mfaRequired: true, tempToken: 123 },
  ])('rejects an invalid runtime login response: %j', (response) => {
    login.mockReturnValue(of(response));

    component.onSubmit();

    expect(component.errorMessage).toBe('Unexpected login response');
    expect(component.showMfa).toBe(false);
    expect(modalService.hideLogin).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
    expect(component.loading).toBe(false);
  });

  it('prioritizes an MFA challenge even if it contains authentication fields', () => {
    const response: MfaResponse = {
      dob: '01-01-2000', mfaRequired: true, jwtToken: 'jwt',
    };
    login.mockReturnValue(of(response));

    component.onSubmit();

    expect(component.showMfa).toBe(true);
    expect(modalService.hideLogin).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });

  it('completes MFA verification using the authentication response', () => {
    const response: AuthenticateResponse = { dob: '01-01-2000', jwtToken: 'jwt' };
    verifyMfa.mockReturnValue(of(response));
    component.showMfa = true;
    component.mfaEmail = 'user@example.test';

    component.onMfaVerify('123456');

    expect(verifyMfa).toHaveBeenCalledExactlyOnceWith('user@example.test', '123456');
    expect(component.showMfa).toBe(false);
    expect(component.mfaEmail).toBe('');
    expect(modalService.hideLogin).toHaveBeenCalledOnce();
    expect(navigate).toHaveBeenCalledWith(['/profile']);
    expect(component.loading).toBe(false);
  });

  it('keeps the MFA dialog open if verification returns no JWT', () => {
    const response: AuthenticateResponse = { dob: null };
    verifyMfa.mockReturnValue(of(response));
    component.showMfa = true;
    component.mfaEmail = 'user@example.test';

    component.onMfaVerify('123456');

    expect(component.errorMessage).toBe('Unexpected MFA verification response');
    expect(component.showMfa).toBe(true);
    expect(navigate).not.toHaveBeenCalled();
    expect(modalService.hideLogin).not.toHaveBeenCalled();
    expect(component.loading).toBe(false);
  });

  it.each([
    null,
    { dob: null, jwtToken: 123 },
    { dob: null, mfaRequired: true, jwtToken: 'jwt' },
  ])('rejects an invalid runtime verification response: %j', (response) => {
    verifyMfa.mockReturnValue(of(response));
    component.showMfa = true;

    component.onMfaVerify('123456');

    expect(component.errorMessage).toBe('Unexpected MFA verification response');
    expect(component.showMfa).toBe(true);
    expect(navigate).not.toHaveBeenCalled();
    expect(component.loading).toBe(false);
  });

  it.each(['Invalid code', 'Code expired'])('handles MFA failure: %s', (message) => {
    verifyMfa.mockReturnValue(throwError(() => new HttpErrorResponse({
      status: 400, error: { message },
    })));
    component.showMfa = true;
    component.mfaEmail = 'user@example.test';

    component.onMfaVerify('123456');

    expect(component.errorMessage).toBe(message);
    expect(component.showMfa).toBe(message === 'Invalid code');
    expect(component.mfaEmail).toBe(message === 'Invalid code' ? 'user@example.test' : '');
    expect(navigate).not.toHaveBeenCalled();
    expect(component.loading).toBe(false);
  });

  it.each([
    ['Plain text failure', 'Plain text failure'],
    [{ message: 'Wrong password' }, 'Wrong password'],
    [{ error: 'Invalid credentials' }, 'Invalid credentials'],
  ])('extracts the login error from %j', (body, expected) => {
    login.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 400, error: body })));

    component.onSubmit();

    expect(component.errorMessage).toBe(expected);
    expect(navigate).not.toHaveBeenCalled();
    expect(component.loading).toBe(false);
  });

  it('clears the MFA challenge on cancellation', () => {
    component.showMfa = true;
    component.mfaEmail = 'user@example.test';
    component.loading = true;

    component.onMfaCancelled();

    expect(component.showMfa).toBe(false);
    expect(component.mfaEmail).toBe('');
    expect(component.loading).toBe(false);
    expect(navigate).not.toHaveBeenCalled();
  });
});
