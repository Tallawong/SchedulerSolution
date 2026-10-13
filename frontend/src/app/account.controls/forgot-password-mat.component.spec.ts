import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Subject, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AccountService } from '../services';
import { ForgotPasswordMatComponent } from './forgot-password-mat.component';

describe('ForgotPasswordMatComponent', () => {
  let fixture: ComponentFixture<ForgotPasswordMatComponent>;
  let component: ForgotPasswordMatComponent;
  let forgotPassword: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    forgotPassword = vi.fn();
    await TestBed.configureTestingModule({
      imports: [ForgotPasswordMatComponent],
      providers: [provideRouter([]), { provide: AccountService, useValue: { forgotPassword } }],
    }).compileComponents();

    fixture = TestBed.createComponent(ForgotPasswordMatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.form.setValue({ email: 'user@example.test', dob: new Date(2000, 0, 1) });
  });

  it('requests a reset once and displays confirmation only after success', async () => {
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
    expect(fixture.nativeElement.querySelector('.alert-success')).toBeNull();
    expect(submitted).not.toHaveBeenCalled();

    response.next();
    response.complete();
    expect(component.success).toBe('Please check your email for password reset instructions');
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="status"]').textContent).toContain(
      'Please check your email for password reset instructions',
    );
    expect(submitted).toHaveBeenCalledOnce();
    component.onSubmit();
    expect(forgotPassword).toHaveBeenCalledOnce();
  });

  it('shows errors without claiming an email was sent', () => {
    forgotPassword.mockReturnValue(throwError(() => ({ error: { message: 'Request failed' } })));

    component.onSubmit();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain(
      'Request failed',
    );
    expect(fixture.nativeElement.querySelector('.alert-success')).toBeNull();
    expect(component.loading).toBe(false);
  });
});
