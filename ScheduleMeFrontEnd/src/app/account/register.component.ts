import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs/operators';

import { toDateTime } from '../core/helpers/date-time';
import { MustMatch } from '../core/helpers';
import { RegisterRequest } from '../dto/requests/register-request';
import { AccountService, AlertService } from '../services';
import { Constants } from '../core/helpers/constants';
import { CustomValidators } from '../core/helpers/custom-validators';

@Component({ standalone: false, templateUrl: 'register.component.html' })
export class RegisterComponent implements OnInit {
  DATE_FORMAT = Constants.dateFormat;

  form!: FormGroup;
  loading = false;
  submitted = false;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private alertService: AlertService,
  ) {}

  ngOnInit() {
    this.form = this.formBuilder.group(
      {
        title: ['', Validators.required],
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        dob: [new Date(), [Validators.required]],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            CustomValidators.createPasswordStrengthValidator(),
          ],
        ],
        confirmPassword: ['', Validators.required],
        acceptTerms: [false, Validators.requiredTrue],
      },
      {
        validators: MustMatch('password', 'confirmPassword'),
      },
    );
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.form.controls;
  }

  onSubmit() {
    this.submitted = true;

    // reset alerts on submit
    this.alertService.clear();

    // stop here if form is invalid
    if (this.form.invalid) {
      return;
    }

    this.loading = true;

    const account: RegisterRequest & { acceptTerms: boolean } = {
      title: this.f['title'].value,
      firstName: this.f['firstName'].value,
      lastName: this.f['lastName'].value,
      email: this.f['email'].value,
      dob: toDateTime(this.f['dob'].value).toJSDate(),
      ts: new Date(),
      password: this.f['password'].value,
      confirmPassword: this.f['confirmPassword'].value,
      acceptTerms: this.f['acceptTerms'].value,
    };

    this.accountService
      .register(account)
      .pipe(first())
      .subscribe({
        next: () => {
          this.alertService.success(
            'Registration successful, please check your email: ' +
              account.email +
              ' for verification instructions',
            { keepAfterRouteChange: true },
          );
          this.router.navigate(['../login'], { relativeTo: this.route });
        },
        error: (error) => {
          this.alertService.error(error);
          this.loading = false;
        },
      });
  }
}
