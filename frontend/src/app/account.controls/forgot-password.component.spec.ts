import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Subject, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AccountService } from '../services';
import { ForgotPasswordComponent } from './forgot-password.component';

describe('ForgotPasswordComponent', () => {
  let fixture: ComponentFixture<ForgotPasswordComponent>;
  let component: ForgotPasswordComponent;
  let forgotPassword: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    forgotPassword = vi.fn();
    await TestBed.configureTestingModule({
      imports: [ForgotPasswordComponent],
      providers: [provideRouter([]), { provide: AccountService, useValue: { forgotPassword } }],
    }).compileComponents();

    fixture = TestBed.createComponent(ForgotPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.model.email = 'user@example.test';
    component.model.dob = '01-01-2000';
  });

  it('displays the requested message only when submission succeeds', async () => {
    const response = new Subject<void>();
    forgotPassword.mockReturnValue(response);
    const submitted = vi.fn();
    component.submitted.subscribe(submitted);

    component.onSubmit();
    fixture.detectChanges();
    expect(forgotPassword).toHaveBeenCalledExactlyOnceWith({
      email: 'user@example.test',
      dob: '01-01-2000',
    });
    expect(fixture.nativeElement.querySelector('[role="alertdialog"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('.fp-form')).not.toBeNull();

    response.next();
    response.complete();
    expect(component.success).toBe('Please check your email for password reset instructions');
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alertdialog"] #fp-confirmation-message').textContent).toBe(
      'Please check your email for password reset instructions',
    );
    expect(fixture.nativeElement.querySelector('.fp-form')).toBeNull();
    expect(submitted).toHaveBeenCalledOnce();
    component.onSubmit();
    expect(forgotPassword).toHaveBeenCalledOnce();

    const cancelled = vi.fn();
    component.cancelled.subscribe(cancelled);
    fixture.nativeElement.querySelector('.fp-confirmation button').click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alertdialog"]')).toBeNull();
    expect(cancelled).toHaveBeenCalledOnce();
  });

  it('shows an error rather than success when submission fails', () => {
    forgotPassword.mockReturnValue(throwError(() => ({ error: { message: 'Request failed' } })));

    component.onSubmit();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.fp-error').textContent).toContain('Request failed');
    expect(fixture.nativeElement.querySelector('[role="alertdialog"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('.fp-form')).not.toBeNull();
    expect(component.loading).toBe(false);
  });

  it('navigates to login when Cancel is pressed', () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    component.onCancel();

    expect(component.visible).toBe(false);
    expect(navigate).toHaveBeenCalledWith(['/account/login']);
  });

  it('binds the native DOB field to a signal and formats its value', () => {
    const dobInput: HTMLInputElement = fixture.nativeElement.querySelector('#dob');
    dobInput.value = '2001-02-03';
    dobInput.dispatchEvent(new Event('input'));
    dobInput.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(component.dobModel().dob).toBe('2001-02-03');
    expect(component.model.dob).toBe('03-02-2001');

    dobInput.value = '';
    dobInput.dispatchEvent(new Event('input'));
    dobInput.dispatchEvent(new Event('change'));
    expect(component.model.dob).toBe('');
  });
});
