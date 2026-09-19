import { Component, EventEmitter, inject, input, model, Output, signal } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

//import { UserService } from '../services/user.service';
import { RegisterRequest } from '../dto/requests/register-request';
import { AccountModalService } from './account-modal.service';
import { EmailAndDobComponent } from '../core/controls/email-dob/email-dob.component';
import { FirstLastComponent } from '../core/controls/first-last/first-last.component';
import {
  HonorificsComponent,
  HonorificsData,
} from '../core/controls/honorifics/honorifics.component';
import { PasswordComponent } from '../core/controls/password/password.component';
import { MobileNumberComponent } from '../core/controls/mobile-number/mobile-number.component';
import { RegistrationFormComponent } from '../core/controls/registration-form/registration-form.component';
import { AcceptTermsComponent } from '../core/controls/accept-terms/accept-terms.component';
import { A11yModule } from '@angular/cdk/a11y';
import { FirstLast } from '../core/controls/first-last/first-last.model';
import { EmailAndDob } from '../core/controls/email-dob/email-dob.model';
import { PasswordConfirm } from '../core/controls/password/password.model';
import { MobileNumber } from '../core/controls/mobile-number/mobile-number.model';
import { AcceptTerms } from '../core/controls/accept-terms/accept-terms.model';
import { AccountService } from '../services';

export interface RegisterPayload
  extends HonorificsData, FirstLast, EmailAndDob, PasswordConfirm, MobileNumber, AcceptTerms {}

@Component({
  standalone: true,
  selector: 'app-register-dialog',
  imports: [
    FormsModule,
    EmailAndDobComponent,
    FirstLastComponent,
    HonorificsComponent,
    PasswordComponent,
    MobileNumberComponent,
    RegistrationFormComponent,
    AcceptTermsComponent,
  ],
  templateUrl: './register-dialog.component.html',
})
export class RegisterDialogComponent {
  visible: boolean = true;
  @Output() cancelled = new EventEmitter<void>();
  @Output() registered = new EventEmitter<RegisterPayload>();
  title = input<string>('');
  message = input<string>('');

  payload: RegisterPayload = {
    salutation: '',
    first: '',
    last: '',
    email: '',
    dob: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  };
  private route = inject(ActivatedRoute);
  constructor(
    private userService: AccountService,
    private router: Router,
    private modalService: AccountModalService,
  ) {
    console.log('RegisterDialogComponent initialized');
  }
  errorMessage = signal('');
  successMessage = signal('');
  loading: boolean = false;
  private readonly redirectDelayMs = 3000;

  //register honorifics
  get salutationValue(): HonorificsData {
    return { salutation: this.payload.salutation };
  }
  set salutationValue(v: HonorificsData) {
    this.payload.salutation = v.salutation;
  }
  // register-dialog.component.ts
  get firstLastValue(): FirstLast {
    return { first: this.payload.first, last: this.payload.last };
  }
  set firstLastValue(v: FirstLast) {
    this.payload.first = v.first;
    this.payload.last = v.last;
  }

  get emailDobValue(): EmailAndDob {
    return { email: this.payload.email, dob: this.payload.dob };
  }
  set emailDobValue(v: EmailAndDob) {
    this.payload.email = v.email;
    this.payload.dob = v.dob;
  }

  get passwordConfirmValue(): PasswordConfirm {
    return {
      password: this.payload.password,
      confirmPassword: this.payload.confirmPassword,
    };
  }
  set passwordConfirmValue(v: PasswordConfirm) {
    this.payload.password = v.password;
    this.payload.confirmPassword = v.confirmPassword;
  }

  get mobileNumberValue(): MobileNumber {
    return { phoneNumber: this.payload.phoneNumber };
  }
  set mobileNumberValue(v: MobileNumber) {
    this.payload.phoneNumber = v.phoneNumber;
  }

  get acceptTermsValue(): AcceptTerms {
    return { acceptTerms: this.payload.acceptTerms };
  }
  set acceptTermsValue(v: AcceptTerms) {
    this.payload.acceptTerms = v.acceptTerms;
  }

  onCancel(): void {
    this.reset();
    this.cancelled.emit();
    this.modalService.showLogin();
    try {
      this.router.navigate(['/account/login']);
    } catch {}
  }

  onRegister(): void {
    this.errorMessage.set('');
    this.successMessage.set('');

    if (!this.payload.salutation) {
      this.errorMessage.set('Please provide your salutation.');
      return;
    }
    if (!this.payload.first || !this.payload.last) {
      this.errorMessage.set('Please provide your name.');
      return;
    }
    if (!this.payload.email) {
      this.errorMessage.set('Please provide an email address.');
      return;
    }
    if (!this.payload.dob) {
      this.errorMessage.set('Please provide your date of birth.');
      return;
    }
    if (!this.payload.phoneNumber) {
      this.errorMessage.set('Please provide a phone number.');
      return;
    }
    if (!this.payload.password) {
      this.errorMessage.set('Please provide a password.');
      return;
    }
    if (this.payload.password.length < 6) {
      this.errorMessage.set('Password must be at least 6 characters long.');
      return;
    }
    if (this.payload.password !== this.payload.confirmPassword) {
      this.errorMessage.set('Passwords do not match.');
      return;
    }
    if (!this.payload.acceptTerms) {
      this.errorMessage.set('You must accept the terms.');
      return;
    }

    this.loading = true;

    const registerRequest: RegisterRequest = {
      email: this.payload.email,
      phoneNumber: this.payload.phoneNumber,
      password: this.payload.password,
      confirmPassword: this.payload.confirmPassword,
      firstName: this.payload.first,
      lastName: this.payload.last,
      dob: new Date(this.payload.dob),
      title: this.payload.salutation,
      ts: new Date(),
    };

    this.userService.register(registerRequest).subscribe({
      next: (res: any) => {
        // Show success message about email verification
        this.successMessage.set(
          'Registration successful, please check your email: ' +
            registerRequest.email +
            ' for verification instructions',
        );
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Registration error:', err);

        // Handle different error response formats
        let errorMsg = 'Registration failed. Please try again.';

        if (err?.error) {
          // If error is a string (e.g., from backend text response)
          if (typeof err.error === 'string') {
            try {
              const parsed = JSON.parse(err.error);
              errorMsg = parsed.message || parsed.error || err.error;
            } catch {
              errorMsg = err.error;
            }
          }
          // If error is an object with message property
          else if (err.error.message) {
            errorMsg = err.error.message;
          }
          // If error has validation errors array
          else if (err.error.errors && Array.isArray(err.error.errors)) {
            errorMsg = err.error.errors.map((e: any) => e.msg || e.message).join(', ');
          }
          // If error object has other properties
          else if (err.error.error) {
            errorMsg = err.error.error;
          }
        }
        // Fallback to err.message or status text
        else if (err.message) {
          errorMsg = err.message;
        } else if (err.statusText) {
          errorMsg = `${err.statusText} (${err.status})`;
        }

        this.errorMessage.set(errorMsg);
        this.loading = false;
      },
    });
  }

  private reset(): void {
    this.payload = {
      salutation: '',
      first: '',
      last: '',
      email: '',
      dob: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    };
    this.errorMessage.set('');
    this.visible = false;
  }
}
