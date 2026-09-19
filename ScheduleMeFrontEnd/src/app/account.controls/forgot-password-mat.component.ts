import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize, first } from 'rxjs/operators';
//import { AccountService, AlertService } from '../_services';
import { Constants } from '../core/helpers/constants';
import { TimeHandler } from '../core/helpers/time.handler';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';

import { MatNativeDateModule } from '@angular/material/core';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  templateUrl: 'forgot-password-mat.component.html',
  selector: 'app-forgot-password-mat',
  imports: [
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ReactiveFormsModule,
  ],
})
export class ForgotPasswordMatComponent implements OnInit {
  DATE_FORMAT = Constants.dateFormat;
  @Input() visible: boolean = true;
  @Output() cancelled = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<{ email: string; dob: string }>();

  form!: FormGroup;
  loading = false;
  model = { email: '', dob: '' };
  error = '';

  constructor(
    private formBuilder: FormBuilder,
    //private accountService: AccountService,
    //private alertService: AlertService
  ) {}

  ngOnInit() {
    this.form = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      dob: ['', [Validators.required, TimeHandler.dateValidator]],
    });
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.form.controls;
  }

  onCancel(): void {
    this.reset();
    this.cancelled.emit();
  }

  onSubmit(): void {
    this.error = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const email = this.form.get('email')?.value ?? '';
    const dobValue = this.form.get('dob')?.value;

    this.loading = true;
    this.submitted.emit({ email, dob: this.formatDob(dobValue) });
    this.loading = false;
  }

  private reset(): void {
    this.model = { email: '', dob: '' };
    this.form.reset({ email: '', dob: '' });
    this.loading = false;
    this.error = '';
    this.visible = false;
  }

  private formatDob(value: unknown): string {
    if (value instanceof Date) {
      const day = String(value.getDate()).padStart(2, '0');
      const month = String(value.getMonth() + 1).padStart(2, '0');
      const year = value.getFullYear();
      return `${day}-${month}-${year}`;
    }

    return typeof value === 'string' ? value : '';
  }
}
