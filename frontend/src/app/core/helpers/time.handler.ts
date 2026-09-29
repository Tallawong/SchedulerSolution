import { Injectable } from '@angular/core';
import { AbstractControl, FormControl } from '@angular/forms';
import type { Sort } from '@angular/material/sort';
import { DateTime } from 'luxon';
import { toDateTime } from './date-time';
import { Constants } from './constants';

@Injectable()
export class TimeHandler {
  constructor() {}

  // Validates that the control value is a valid date (Date object or ISO-8601 string).
  static dateValidator(control: FormControl) {
    if (!control || control.value == null || control.value === '') {
      return null;
    }

    const val = control.value;

    if (DateTime.isDateTime(val)) {
      return val.isValid ? null : { dateValidator: true };
    }

    if (val instanceof Date) {
      return isNaN(val.getTime()) ? { dateValidator: true } : null;
    }

    if (typeof val === 'string') {
      // Allow plain date (YYYY-MM-DD) or ISO datetime strings.
      const isoDateRegex = /^\d{4}-\d{2}-\d{2}(T.*)?$/;
      if (!isoDateRegex.test(val)) {
        return { dateValidator: true };
      }
      const parsed = new Date(val);
      return isNaN(parsed.getTime()) ? { dateValidator: true } : null;
    }

    return { dateValidator: true };
  }

  // Validates a date-time value (accepts Date or any parsable date-time string).
  static dateTimeValidator(control: AbstractControl) {
    if (!control || control.value == null || control.value === '') {
      return null;
    }

    const val = control.value;
    if (DateTime.isDateTime(val)) {
      return val.isValid ? null : { dateValidator: true };
    }
    if (val instanceof Date) {
      return isNaN(val.getTime()) ? { dateValidator: true } : null;
    }

    if (typeof val === 'string') {
      const parsed = new Date(val);
      return isNaN(parsed.getTime()) ? { dateValidator: true } : null;
    }

    return { dateValidator: true };
  }
  static sortData<T extends { date: string }>(dateSort: T[], sort: Sort): void {
    console.log('Sortation by date');
    if (!sort.active || sort.direction == '') {
      return;
    }
    dateSort.sort((a, b) => {
      let isAsc = sort.direction == 'asc';
      var date1 = toDateTime(a.date, Constants.dateTimeFormat).toMillis();
      var date2 = toDateTime(b.date, Constants.dateTimeFormat).toMillis();
      if (date1 < date2) {
        return isAsc ? -1 : 1;
      } else if (date1 > date2) {
        return isAsc ? 1 : -1;
      } else {
        return 0;
      }
    });
  }
  static getDayStrFromDate(dateStr: string): string {
    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var date = toDateTime(dateStr, Constants.dateTimeFormat).toJSDate();
    return days[date.getDay()];
  }
}
