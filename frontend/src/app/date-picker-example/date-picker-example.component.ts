import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { provideLuxonDateAdapter } from '@angular/material-luxon-adapter';
import type { DateTime } from 'luxon';

@Component({
  selector: 'app-date-picker-example',
  standalone: true,
  imports: [ReactiveFormsModule, MatDatepickerModule, MatFormFieldModule, MatInputModule],
  // Keep this adapter local so existing date fields are not affected.
  // Luxon format tokens are case-sensitive.
  providers: [
    provideLuxonDateAdapter({
      parse: { dateInput: 'MM/dd/yyyy' },
      display: {
        dateInput: 'MM/dd/yyyy',
        monthYearLabel: 'MMM yyyy',
        dateA11yLabel: 'DDD',
        monthYearA11yLabel: 'MMMM yyyy',
      },
    }),
  ],
  templateUrl: './date-picker-example.component.html',
  styleUrl: './date-picker-example.component.css',
})
export class DatePickerExampleComponent {
  // Both typing a date and picking one update this Luxon DateTime control.
  // Start empty so server and browser rendering have the same initial value.
  readonly selectedDate = new FormControl<DateTime | null>(null);

  get formattedDate(): string {
    const date = this.selectedDate.value;
    // Format a date-only value without converting it to a UTC timestamp.
    return this.selectedDate.valid && date?.isValid
      ? date.toFormat('yyyy-MM-dd')
      : 'No valid date selected';
  }
}
