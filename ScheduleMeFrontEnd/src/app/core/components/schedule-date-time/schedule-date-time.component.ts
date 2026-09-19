import { Component, EventEmitter, forwardRef, OnDestroy, Output } from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  FormControl,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  ValidationErrors,
  Validator,
} from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { MAT_LUXON_DATE_FORMATS, provideLuxonDateAdapter } from '@angular/material-luxon-adapter';
import { DateTime } from 'luxon';
import { toDateTime } from '../../helpers/date-time';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-schedule-date-time',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatTimepickerModule,
  ],
  providers: [
    provideLuxonDateAdapter({
      parse: { ...MAT_LUXON_DATE_FORMATS.parse, dateInput: 'dd-MM-yyyy', timeInput: 'HH:mm' },
      display: {
        ...MAT_LUXON_DATE_FORMATS.display,
        dateInput: 'dd-MM-yyyy',
        timeInput: 'HH:mm',
        timeOptionLabel: 'HH:mm',
      },
    }),
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ScheduleDateTimeComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => ScheduleDateTimeComponent),
      multi: true,
    },
  ],
  template: `
    <div class="schedule-date-time">
      <mat-form-field appearance="outline">
        <mat-label>Schedule date</mat-label>
        <input
          matInput
          [matDatepicker]="datePicker"
          [formControl]="dateControl"
          placeholder="DD-MM-YYYY"
          (blur)="markTouched()"
        />
        <mat-datepicker-toggle matIconSuffix [for]="datePicker"></mat-datepicker-toggle>
        <mat-datepicker #datePicker></mat-datepicker>
        <mat-hint>DD-MM-YYYY</mat-hint>
        <mat-error>Enter a valid schedule date</mat-error>
      </mat-form-field>
      <mat-form-field appearance="outline">
        <mat-label>Schedule time</mat-label>
        <input
          matInput
          [matTimepicker]="timePicker"
          [formControl]="timeControl"
          placeholder="HH:mm"
          (blur)="markTouched()"
        />
        <mat-timepicker-toggle matIconSuffix [for]="timePicker"></mat-timepicker-toggle>
        <mat-timepicker #timePicker interval="1m"></mat-timepicker>
        <mat-hint>HH:mm (24-hour)</mat-hint>
        <mat-error>Enter a valid schedule time</mat-error>
      </mat-form-field>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .schedule-date-time {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
      }
      mat-form-field {
        flex: 1 1 10rem;
        min-width: 0;
      }
    `,
  ],
})
export class ScheduleDateTimeComponent implements ControlValueAccessor, Validator, OnDestroy {
  @Output() dateChange = new EventEmitter<{ value: Date | null }>();
  readonly dateControl = new FormControl<DateTime | null>(null);
  readonly timeControl = new FormControl<DateTime | null>(null);
  private readonly subscriptions = new Subscription();
  private onChange: (value: Date | null) => void = () => {};
  private onTouched: () => void = () => {};
  private onValidatorChange: () => void = () => {};

  constructor() {
    this.subscriptions.add(this.dateControl.valueChanges.subscribe(() => this.updateValue()));
    this.subscriptions.add(this.timeControl.valueChanges.subscribe(() => this.updateValue()));
    this.subscriptions.add(
      this.dateControl.statusChanges.subscribe(() => this.onValidatorChange()),
    );
    this.subscriptions.add(
      this.timeControl.statusChanges.subscribe(() => this.onValidatorChange()),
    );
  }

  writeValue(value: Date | DateTime | string | null): void {
    const parsed = toDateTime(value);
    const valid = parsed.isValid ? parsed : null;
    this.dateControl.setValue(valid, { emitEvent: false });
    this.timeControl.setValue(valid, { emitEvent: false });
  }

  registerOnChange(fn: (value: Date | null) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  registerOnValidatorChange(fn: () => void): void {
    this.onValidatorChange = fn;
  }

  setDisabledState(disabled: boolean): void {
    for (const control of [this.dateControl, this.timeControl]) {
      if (disabled) control.disable({ emitEvent: false });
      else control.enable({ emitEvent: false });
    }
  }

  validate(_control: AbstractControl): ValidationErrors | null {
    return this.dateControl.invalid || this.timeControl.invalid ? { scheduleDateTime: true } : null;
  }

  markTouched(): void {
    this.onTouched();
  }

  private updateValue(): void {
    const date = this.dateControl.value;
    const time = this.timeControl.value;
    const value =
      date?.isValid && time?.isValid
        ? date.set({ hour: time.hour, minute: time.minute, second: 0, millisecond: 0 }).toJSDate()
        : null;
    this.onChange(value);
    this.onValidatorChange();
    this.dateChange.emit({ value });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
