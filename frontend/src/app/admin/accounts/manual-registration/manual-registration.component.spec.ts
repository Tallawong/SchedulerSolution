import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Account, Role } from '../../../entities';
import { AccountService, AlertService } from '../../../services';
import { ManualRegistrationComponent } from './manual-registration.component';

describe('ManualRegistrationComponent', () => {
  let fixture: ComponentFixture<ManualRegistrationComponent>;
  let component: ManualRegistrationComponent;
  let params: { id?: string };
  let create: ReturnType<typeof vi.fn>;
  let update: ReturnType<typeof vi.fn>;
  let getById: ReturnType<typeof vi.fn>;
  let alertError: ReturnType<typeof vi.fn>;
  let navigate: ReturnType<typeof vi.spyOn>;

  const validForm = {
    title: 'Ms',
    firstName: 'First',
    lastName: 'Last',
    email: 'person@example.test',
    dob: '2000-02-29',
    phoneNumber: '',
    role: Role.User,
    password: 'secret12',
    confirmPassword: 'secret12',
  };

  const existingAccount = {
    ...new Account(),
    id: 'account-1',
    title: 'Mrs',
    firstName: 'Mary Jane',
    lastName: 'Smith',
    email: 'mary@example.test',
    dob: '22-09-2000',
    phoneNumber: '',
    role: Role.User,
    isVerified: true,
  };

  beforeEach(async () => {
    params = {};
    create = vi.fn().mockReturnValue(of({}));
    update = vi.fn().mockReturnValue(of(existingAccount));
    getById = vi.fn().mockReturnValue(of(existingAccount));
    alertError = vi.fn();
    await TestBed.configureTestingModule({
      imports: [ManualRegistrationComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { params } } },
        { provide: AccountService, useValue: { create, update, getById } },
        { provide: AlertService, useValue: { clear: vi.fn(), error: alertError } },
      ],
    }).compileComponents();
    navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
  });

  function render(): void {
    fixture = TestBed.createComponent(ManualRegistrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('renders a page with the registration fields and no dialog overlay', () => {
    render();

    expect(fixture.nativeElement.querySelector('h1').textContent).toContain('Create Account');
    expect(fixture.nativeElement.querySelector('[role="dialog"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('.lp-overlay')).toBeNull();
    expect(fixture.nativeElement.querySelector('input[type="date"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('#manual-role')).not.toBeNull();
  });

  it('creates an account with the admin API and formatted date', () => {
    render();
    component.model.set(validForm);

    component.onSubmit();

    expect(create).toHaveBeenCalledExactlyOnceWith({ ...validForm, dob: '29-02-2000' });
    expect(update).not.toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith(['/admin/accounts']);
    expect(component.loading()).toBe(false);
  });

  it('rejects invalid input and mismatched passwords', () => {
    render();
    component.model.set({ ...validForm, email: 'invalid', dob: '2026-02-31', confirmPassword: 'different' });

    component.onSubmit();
    fixture.detectChanges();

    expect(create).not.toHaveBeenCalled();
    expect(component.form.email().errors().some((error) => error.kind === 'email')).toBe(true);
    expect(component.form.dob().errors().some((error) => error.kind === 'invalidDate')).toBe(true);
    expect(component.form.confirmPassword().errors().some((error) => error.kind === 'mustMatch')).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('Passwords must match.');
  });

  it('requires a password when creating', () => {
    render();
    component.model.set({ ...validForm, password: '', confirmPassword: '' });

    component.onSubmit();

    expect(component.form.password().errors().some((error) => error.kind === 'required')).toBe(true);
    expect(create).not.toHaveBeenCalled();
  });

  it('updates the signal model from field input and submits the form', () => {
    render();
    component.model.set(validForm);
    fixture.detectChanges();
    const firstName: HTMLInputElement = fixture.nativeElement.querySelector('#manual-first-name');
    firstName.value = 'Updated';
    firstName.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(component.model().firstName).toBe('Updated');
    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit', { cancelable: true }));

    expect(create).toHaveBeenCalledExactlyOnceWith({ ...validForm, firstName: 'Updated', dob: '29-02-2000' });
  });

  it('revalidates the confirmation when the password changes', () => {
    render();
    component.model.set(validForm);
    expect(component.form.confirmPassword().valid()).toBe(true);

    component.form.password().value.set('another-secret');

    expect(component.form.confirmPassword().invalid()).toBe(true);
    component.onSubmit();
    expect(create).not.toHaveBeenCalled();
  });

  it('rejects short passwords when editing', () => {
    params.id = 'account-1';
    render();
    component.model.update((model) => ({ ...model, password: 'short', confirmPassword: 'short' }));

    component.onSubmit();

    expect(component.form.password().invalid()).toBe(true);
    expect(update).not.toHaveBeenCalled();
  });

  it('loads an existing account and saves with an optional password', () => {
    params.id = 'account-1';
    render();

    expect(getById).toHaveBeenCalledExactlyOnceWith('account-1');
    expect(component.form.dob().value()).toBe('2000-09-22');
    expect(component.form.firstName().value()).toBe('Mary Jane');
    expect(fixture.nativeElement.querySelector('h1').textContent).toContain('Edit Account');

    component.onSubmit();

    expect(update).toHaveBeenCalledExactlyOnceWith('account-1', {
      title: 'Mrs',
      firstName: 'Mary Jane',
      lastName: 'Smith',
      email: 'mary@example.test',
      dob: '22-09-2000',
      phoneNumber: '',
      role: Role.User,
      password: '',
      confirmPassword: '',
    });
    expect(component.successMessage()).toBe('Account updated successfully.');
    expect(navigate).not.toHaveBeenCalled();
  });

  it('blocks saving until account details have loaded', () => {
    params.id = 'account-1';
    const response = new Subject<Account>();
    getById.mockReturnValue(response);
    render();

    component.model.set(validForm);
    component.onSubmit();

    expect(update).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('button[type="submit"]').disabled).toBe(true);
    response.next(existingAccount);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('button[type="submit"]').disabled).toBe(false);
  });

  it('blocks saving and reports a failed account load', () => {
    params.id = 'account-1';
    const error = new Error('load failed');
    getById.mockReturnValue(throwError(() => error));
    render();

    component.model.set(validForm);
    component.onSubmit();

    expect(update).not.toHaveBeenCalled();
    expect(alertError).toHaveBeenCalledWith(error);
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain('Unable to load');
  });

  it('reports save errors and permits another attempt', () => {
    const error = new Error('save failed');
    create.mockReturnValue(throwError(() => error));
    render();
    component.model.set(validForm);

    component.onSubmit();
    fixture.detectChanges();

    expect(alertError).toHaveBeenCalledWith(error);
    expect(component.loading()).toBe(false);
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain('Unable to save');
  });

  it('disables related actions for an unverified user', () => {
    params.id = 'account-1';
    getById.mockReturnValue(of({ ...existingAccount, isVerified: false }));
    render();

    const actions = fixture.nativeElement.querySelectorAll('.related-actions button');
    expect(actions.length).toBe(2);
    expect(actions[0].disabled).toBe(true);
    expect(actions[1].disabled).toBe(true);
  });
});
