import { DateTime } from 'luxon';
import { Constants } from './constants';

/** Normalize form values and API dates without changing local calendar dates. */
export function toDateTime(value: unknown, format?: string): DateTime {
  if (DateTime.isDateTime(value)) return value;
  if (value instanceof Date) return DateTime.fromJSDate(value);
  if (typeof value === 'string' && value.trim() !== '') {
    const text = value.trim();
    if (format) {
      const parsed = DateTime.fromFormat(text, format);
      if (parsed.isValid) return parsed;
    }
    const iso = DateTime.fromISO(text);
    if (iso.isValid) return iso;
    for (const fallback of [Constants.dateTimeFormat, Constants.dateFormat]) {
      const parsed = DateTime.fromFormat(text, fallback);
      if (parsed.isValid) return parsed;
    }
  }
  return DateTime.invalid('Unsupported or invalid date value');
}
