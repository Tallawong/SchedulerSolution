import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';

import { Alert, AlertType } from '../../entities';
import { ViewportScroller } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class AlertService {
  private subject = new Subject<Alert>();
  private defaultId = 'default-alert';

  constructor(private scroller: ViewportScroller) {}

  // enable subscribing to alerts observable
  onAlert(id = this.defaultId): Observable<Alert> {
    return this.subject.asObservable().pipe(filter((x) => x && x.id === id));
  }

  // convenience methods
  success(message: string, options?: any) {
    this.alert(new Alert({ ...options, type: AlertType.Success, message }));
  }

  error(error: unknown, options?: any) {
    const message = this.errorMessage(error) || 'An unexpected error occurred. Please try again.';
    this.alert(new Alert({ ...options, type: AlertType.Error, message }));
  }

  // HTTP failures may wrap API messages in error.error or validation errors.
  // Always publish text, never an object or raw HTML.
  private errorMessage(value: unknown, seen = new Set<object>()): string | undefined {
    if (typeof value === 'string') return value.trim() || undefined;
    if (value === null || typeof value !== 'object' || seen.has(value)) return undefined;
    seen.add(value);

    if (Array.isArray(value)) {
      return value.map((item) => this.errorMessage(item, seen)).filter(Boolean).join('; ') || undefined;
    }

    const error = value as Record<string, unknown>;
    const nested = this.errorMessage(error['error'], seen);
    if (nested) return nested;

    const validation = error['errors'];
    if (validation && typeof validation === 'object') {
      const details = Object.entries(validation)
        .map(([field, messages]) => {
          const text = this.errorMessage(messages, seen);
          return text ? (field ? `${field}: ${text}` : text) : '';
        })
        .filter(Boolean)
        .join('; ');
      if (details) return details;
    }

    for (const key of ['detail', 'errorMessage', 'message', 'title']) {
      const text = error[key];
      if (typeof text === 'string' && text.trim()) return text.trim();
    }
    return undefined;
  }

  info(message: string, options?: any) {
    this.alert(new Alert({ ...options, type: AlertType.Info, message }));
  }

  warn(message: string, options?: any) {
    this.alert(new Alert({ ...options, type: AlertType.Warning, message }));
  }

  // core alert method
  alert(alert: Alert) {
    alert.id = alert.id || this.defaultId;
    alert.autoClose = alert.autoClose === undefined ? true : alert.autoClose;
    this.subject.next(alert);
    this.scroller.scrollToAnchor('pageStart');
  }

  // clear alerts
  clear(id = this.defaultId) {
    this.subject.next(new Alert({ id }));
  }
}
