import { DateTime } from 'luxon';
import { FormControl } from '@angular/forms';
import { toDateTime } from './date-time';
import { Constants } from './constants';
import { TimeHandler } from './time.handler';

describe('Luxon date conversion', () => {
  it('round-trips the API date and schedule formats', () => {
    expect(toDateTime('17-09-2026', Constants.dateFormat).toFormat(Constants.dateFormat)).toBe(
      '17-09-2026',
    );
    const schedule = toDateTime('17-09-2026 14:35', Constants.dateTimeFormat);
    expect(schedule.isValid).toBe(true);
    expect(schedule.toFormat(Constants.dateTimeFormat)).toBe('17-09-2026 14:35');
    expect(schedule.hour).toBe(14);
  });

  it('accepts Date, ISO strings, and existing DateTime values', () => {
    const date = new Date(2026, 8, 17, 14, 35);
    expect(toDateTime(date).toJSDate()).toEqual(date);
    expect(toDateTime('2026-09-17', Constants.dateFormat).toFormat(Constants.dateFormat)).toBe(
      '17-09-2026',
    );
    const luxonDate = DateTime.local(2026, 9, 17);
    expect(toDateTime(luxonDate)).toBe(luxonDate);
  });

  it('rejects missing values and impossible calendar dates', () => {
    for (const value of [null, undefined, '', '31-02-2026', 'not a date']) {
      expect(toDateTime(value).isValid).toBe(false);
    }
  });

  it('validates Luxon-valued form controls', () => {
    const valid = new FormControl(DateTime.local(2026, 9, 17));
    const invalid = new FormControl(DateTime.invalid('Invalid date'));
    expect(TimeHandler.dateValidator(valid)).toBeNull();
    expect(TimeHandler.dateTimeValidator(valid)).toBeNull();
    expect(TimeHandler.dateValidator(invalid)).toEqual({ dateValidator: true });
    expect(TimeHandler.dateTimeValidator(invalid)).toEqual({ dateValidator: true });
  });
});
