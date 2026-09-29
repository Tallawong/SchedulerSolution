import { TestBed } from '@angular/core/testing';
import { ViewportScroller } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { AlertService } from './alert.service';

describe('AlertService error messages', () => {
  function displayMessage(error: unknown): string {
    TestBed.configureTestingModule({
      providers: [
        AlertService,
        { provide: ViewportScroller, useValue: { scrollToAnchor: () => {} } },
      ],
    });
    const service = TestBed.inject(AlertService);
    let message = '';
    const subscription = service.onAlert().subscribe(alert => message = alert.message);
    service.error(error);
    subscription.unsubscribe();
    return message;
  }

  it('preserves plain messages', () => {
    expect(displayMessage('Login failed')).toBe('Login failed');
  });

  it('extracts the API message from an HTTP error', () => {
    expect(displayMessage(new HttpErrorResponse({
      status: 400,
      error: { message: 'Email or password is incorrect' },
    }))).toBe('Email or password is incorrect');
  });

  it('handles nested error strings', () => {
    expect(displayMessage({ error: { error: 'Invalid credentials' } }))
      .toBe('Invalid credentials');
  });

  it('extracts validation messages', () => {
    expect(displayMessage({ error: { errors: { Email: ['Email is required'] } } }))
      .toBe('Email: Email is required');
  });

  it('handles native Error objects', () => {
    expect(displayMessage(new Error('Connection failed'))).toBe('Connection failed');
  });

  it('provides a fallback for unrecognized objects', () => {
    expect(displayMessage({ unexpected: 123 }))
      .toBe('An unexpected error occurred. Please try again.');
  });

  it('handles circular error objects', () => {
    const error: { error?: unknown; message: string } = { message: 'Request failed' };
    error.error = error;
    expect(displayMessage(error)).toBe('Request failed');
  });
});
