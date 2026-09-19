import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { toDateTime } from '../core/helpers/date-time';
import { finalize, first } from 'rxjs/operators';
import { TimeHandler } from '../core/helpers/time.handler';
import { AccountService, AlertService } from '../services';
import { Constants } from '../core/helpers/constants';

@Component({ standalone: false, templateUrl: 'forgot-password.component.html' })
export class ForgotPasswordComponent implements OnInit {
  DATE_FORMAT = Constants.dateFormat;

  form!: FormGroup;
  loading = false;
  submitted = false;

  constructor(
    private formBuilder: FormBuilder,
    private accountService: AccountService,
    private alertService: AlertService,
  ) {}

  ngOnInit() {
    this.form = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      dob: [new Date(), [Validators.required, TimeHandler.dateValidator]],
    });
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
    this.alertService.clear();
    this.accountService
      .forgotPassword({
        email: this.f['email'].value,
        dob: toDateTime(this.f['dob'].value).toFormat(Constants.dateFormat),
      })
      .pipe(first())
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: () =>
          this.alertService.success('Please check your email for password reset instructions'),
        error: (error) => this.alertService.error(error),
      });
  }
}
