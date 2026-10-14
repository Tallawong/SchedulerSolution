import { HttpErrorResponse } from '@angular/common/http';
import { Component, signal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';

import {
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { finalize, Subscription } from 'rxjs';
import { DateTime } from 'luxon';
import { MAT_LUXON_DATE_FORMATS, provideLuxonDateAdapter } from '@angular/material-luxon-adapter';

import { AccountModalService } from '../account.controls/account-modal.service';
import { LoginRequest } from '../dto/requests/login-request';
import { MfaResponse } from '../dto/responses/mfa-response';
import { AuthenticateResponse } from '../shared/openapi-api-client/model/authenticateResponse';

import { Router } from '@angular/router';
import { AccountService } from '../services';

import { isAuthenticateResponse, isMfaResponse } from '../core/helpers/auth-response';
import { Constants } from '../core/helpers/constants';
import { toDateTime } from '../core/helpers/date-time';

interface LoginData {
  email: string;
  password: string;
  dob: string;
}

@Component({
  standalone: true,
  providers: [
    provideLuxonDateAdapter({
      parse: { ...MAT_LUXON_DATE_FORMATS.parse, dateInput: Constants.dateFormat },
      display: { ...MAT_LUXON_DATE_FORMATS.display, dateInput: Constants.dateFormat },
    }),
  ],
  imports: [
    FormField,
  ],
  selector: 'app-login-prompt',
  templateUrl: './login-prompt.component.html',
  styleUrls: ['./login-prompt.component.css'],
  host: { class: 'app-dialog-theme' },
})
export class LoginPromptComponent implements OnInit, OnDestroy {
  @Input() visible: boolean = true;
  @Output() cancelled = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<LoginRequest>();
  @Output() register = new EventEmitter<void>();
  @Output() forgotPassword = new EventEmitter<void>();

  errorMessage = signal('');
  loading = signal(false);
  // MFA UI state
  showMfa: boolean = false;
  mfaEmail: string = '';
  private subs: Subscription[] = [];

  readonly loginModel = signal<LoginData>({
    email: '',
    password: '',
    dob: toDateTime(new Date()).toISODate() ?? '',
  });

  readonly loginForm = form(this.loginModel);

  constructor(
    private accountService: AccountService,
    private router: Router,
    private modalService: AccountModalService,
  ) {
    console.log('LoginPromptComponent initialized');
  }
  ngOnInit(): void {
    // Initialize the component

    this.errorMessage.set('');
    this.loading.set(false);
    this.modalService.showLogin();

    this.subs.push(
      // Sync visibility with shared modal service
      this.modalService.loginVisible$.subscribe((v) => {
        this.visible = v;
      }),
    );
  }

  onCancel(): void {
    this.visible = false;
    this.modalService.hideLogin();
    this.loading.set(false);
    this.cancelled.emit();
    this.router.navigate(['/']);
  }
  onSubmit(event?: Event): void {
    event?.preventDefault(); // Prevent default form submission behavior

    this.errorMessage.set('');
    const { email, password, dob } = this.loginModel();
    const dateOfBirth = toDateTime(dob);
    if (!dateOfBirth.isValid) {
      this.errorMessage.set('Enter a valid date of birth.');
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.accountService
      .login(email, password, dateOfBirth.toFormat(Constants.dateFormat))
      .pipe(
        finalize(() => {
          this.loading.set(false);
        }),
      )
      .subscribe({
        next: (data: MfaResponse | AuthenticateResponse) => {
          if (isMfaResponse(data) && data.mfaRequired) {
            this.mfaEmail = email;
            this.showMfa = true;
            return;
          }

          // Normal login with token
          if (isAuthenticateResponse(data) && data.jwtToken?.trim()) {
            this.completeLogin();
            return;
          }

          // Unexpected response
          this.errorMessage.set('Unexpected login response');
        },
        error: (err: unknown) => {
          this.errorMessage.set(this.getErrorMessage(err, 'Login failed'));
        },
      });
  }

  onRegister(): void {
    this.register.emit();
    this.router.navigate(['/account/register'], {
      queryParams: {
        title: 'Create an account',
        message: "Join now — it's quick and easy",
      },
    });
  }

  onForgotPassword(): void {
    this.forgotPassword.emit();
    this.router.navigate(['/account/forgot-password']);
  }

  // MFA dialog handlers
  onMfaVerify(code: string): void {
    this.errorMessage.set('');
    this.loading.set(true);
    this.accountService
      .verifyMfa(this.mfaEmail, code)
      .pipe(
        finalize(() => {
          this.loading.set(false);
        }),
      )
      .subscribe({
        next: (response: AuthenticateResponse) => {
          if (
            !isAuthenticateResponse(response) ||
            !response.jwtToken?.trim() ||
            (isMfaResponse(response) && response.mfaRequired)
          ) {
            this.errorMessage.set('Unexpected MFA verification response');
            return;
          }

          this.completeLogin();
        },
        error: (err: unknown) => {
          const msg = this.getErrorMessage(err, 'Invalid code');
          this.errorMessage.set(msg);
          // If the server indicates the code expired, close the MFA dialog so
          // the login error message is visible and user can retry login.
          if (/expire/i.test(msg)) {
            this.showMfa = false;
            this.mfaEmail = '';
          }
        },
      });
  }

  private completeLogin(): void {
    this.showMfa = false;
    this.mfaEmail = '';
    this.modalService.hideLogin();
    this.router.navigate(['/profile']);
  }

  private getErrorMessage(error: unknown, fallback: string): string {
    const body: unknown = error instanceof HttpErrorResponse ? error.error : error;
    if (typeof body === 'string' && body) return body;
    if (typeof body === 'object' && body !== null) {
      if ('error' in body && typeof body.error === 'string' && body.error) return body.error;
      if ('message' in body && typeof body.message === 'string' && body.message) {
        return body.message;
      }
    }
    return error instanceof HttpErrorResponse && error.message ? error.message : fallback;
  }

  onMfaCancelled(): void {
    this.showMfa = false;
    this.mfaEmail = '';
    this.loading.set(false);
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }
}
