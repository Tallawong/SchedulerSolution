import { HttpErrorResponse } from '@angular/common/http';
import { Component, signal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';

import {
    ChangeDetectorRef,
    EventEmitter,
    Input,
    NgZone,
    OnDestroy,
    OnInit,
    Output,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { finalize, Subscription } from 'rxjs';

import { AccountModalService } from '../account.controls/account-modal.service';
import { LoginRequest } from '../dto/requests/login-request';
import { MfaResponse } from '../dto/responses/mfa-response';
import { AuthenticateResponse } from '../shared/openapi-api-client/model/authenticateResponse';
import { MfaDialogComponent } from './mfa-dialog.component';

import { Router } from '@angular/router';
import { AccountService } from '../services';

import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
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
  imports: [
    FormField,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,

    MfaDialogComponent,
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

  errorMessage = '';
  loading: boolean = false;
  // MFA UI state
  showMfa: boolean = false;
  mfaEmail: string = '';
  private subs: Subscription[] = [];

  readonly loginModel = signal<LoginData>({
    email: '',
    password: '',

    /* Native HTML <input type="date"> uses yyyy-MM-dd for its underlying value,
      as defined by the HTML standard.Native HTML <input type="date"> uses yyyy-MM-dd
      for its underlying value, as defined by the HTML standard.*/
    dob: toDateTime(new Date()).toISODate() ?? '',
  });

  // Keep existing imports, importing form and validators from @angular/forms/signals.
  // Do not import or call objectSchema.
  readonly loginForm = form(this.loginModel); //, (schema) => {
  // Retain existing email, password, and dateInQuestion validation rules here,
  // using Angular Signal Forms schema validators directly, not objectSchema.
  //});

  constructor(
    private userService: AccountService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    private modalService: AccountModalService,
  ) {
    console.log('LoginPromptComponent initialized');
  }
  ngOnInit(): void {
    // Initialize the component

    this.errorMessage = '';
    this.loading = false;
    this.modalService.showLogin();

    // Sync visibility with shared modal service
    this.subs.push(
      this.modalService.loginVisible$.subscribe((v) => {
        this.visible = v;
        try {
          this.cdr.detectChanges();
        } catch {}
      }),
    );
  }

  onCancel(): void {
    this.visible = false;
    this.modalService.hideLogin();
    this.loading = false;
    this.cancelled.emit();
    try {
      this.router.navigate(['/']);
    } catch {}
  }
  onSubmit(): void {
    this.errorMessage = '';
    const { email, password, dob } = this.loginModel();
    const dateOfBirth = toDateTime(dob);
    if (!dateOfBirth.isValid) {
      this.errorMessage = 'Enter a valid date of birth.';
      this.loading = false;
      return;
    }

    this.loading = true;
    this.userService
      .login(email, password, dateOfBirth.toFormat(Constants.dateFormat))
      .pipe(
        finalize(() => {
          this.loading = false;
          try {
            this.cdr.detectChanges();
          } catch {}
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
          this.errorMessage = 'Unexpected login response';
        },
        error: (err: unknown) => {
          this.errorMessage = this.getErrorMessage(err, 'Login failed');
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
    try {
      this.router.navigate(['/account/forgot-password']);
    } catch {}
  }

  // MFA dialog handlers
  onMfaVerify(code: string): void {
    this.errorMessage = '';
    this.loading = true;
    this.userService
      .verifyMfa(this.mfaEmail, code)
      .pipe(
        finalize(() => {
          this.loading = false;
          try {
            this.cdr.detectChanges();
          } catch {}
        }),
      )
      .subscribe({
        next: (response: AuthenticateResponse) => {
          if (!isAuthenticateResponse(response) || !response.jwtToken?.trim()
            || (isMfaResponse(response) && response.mfaRequired)) {
            this.errorMessage = 'Unexpected MFA verification response';
            return;
          }

          this.completeLogin();
        },
        error: (err: unknown) => {
          const msg = this.getErrorMessage(err, 'Invalid code');
          this.errorMessage = msg;
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
    this.ngZone.run(() => {
      this.modalService.hideLogin();
      this.cdr.detectChanges();
      this.router.navigate(['/profile']);
    });
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
    this.loading = false;
    try {
      this.cdr.detectChanges();
    } catch {}
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }
}
