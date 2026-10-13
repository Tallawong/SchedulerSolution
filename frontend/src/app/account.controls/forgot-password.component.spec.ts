import { ComponentFixture, TestBed } from '@angular/core/testing';
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
      providers: [{ provide: AccountService, useValue: { forgotPassword } }],
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
    expect(fixture.nativeElement.querySelector('.fp-success')).toBeNull();

    response.next();
    response.complete();
    expect(component.success).toBe('Please check your email for password reset instructions');
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.fp-success[role="status"]').textContent).toContain(
      'Please check your email for password reset instructions',
    );
    expect(submitted).toHaveBeenCalledOnce();
    component.onSubmit();
    expect(forgotPassword).toHaveBeenCalledOnce();
  });

  it('shows an error rather than success when submission fails', () => {
    forgotPassword.mockReturnValue(throwError(() => ({ error: { message: 'Request failed' } })));

    component.onSubmit();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.fp-error').textContent).toContain('Request failed');
    expect(fixture.nativeElement.querySelector('.fp-success')).toBeNull();
    expect(component.loading).toBe(false);
  });
});
