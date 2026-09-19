import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs/operators';

import { toDateTime } from '../core/helpers/date-time';
import { CustomValidators } from '../core/helpers/custom-validators';
import { TimeHandler } from '../core/helpers/time.handler';
import { AccountService, AlertService } from '../services';
import { Constants } from '../core/helpers/constants';

@Component({
  standalone: false,
  templateUrl: 'login.component.html',
  styleUrls: ['login.component.less'],
})
export class LoginComponent implements OnInit {
  DATE_FORMAT = Constants.dateFormat;

  form!: FormGroup;
  loading = signal<boolean>(false);
  submitted = false;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private alertService: AlertService,
  ) {}

  ngOnInit() {
    this.form = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, CustomValidators.createPasswordStrengthValidator()]],
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

    this.loading.set(true);
    this.accountService
      .login(
        this.f['email'].value,
        this.f['password'].value,
        toDateTime(this.f['dob'].value).toFormat(Constants.dateFormat),
      )
      .pipe(first())
      .subscribe({
        next: () => {
          // get return url from query parameters or default to home page
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
          this.router.navigateByUrl(returnUrl);
        },
        error: (error) => {
          this.alertService.error(error);
          this.loading.set(false);
        },
      });
  }
}
