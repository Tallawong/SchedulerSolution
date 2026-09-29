import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AccountService } from '../../services/account/account.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const accountService = inject(AccountService);

  return next(req).pipe(
    catchError((err: unknown) => {
      console.error('ErrorInterceptor:', getErrorMessage(err), err);
      if (isHttpErrorResponse(err)) {
        if ([401, 403].includes(err.status) && accountService.accountValue) {
          accountService.logout();
        }
        // dump the raw parsed response body so backend validation details aren't lost to console collapsing
        console.error('ErrorInterceptor response body:', JSON.stringify(err.error, null, 2));
      }
      return throwError(() => err);
    }),
  );
};

function getErrorMessage(err: unknown): string {
  if (err == null) {
    return 'Unknown Error';
  }

  if (typeof err === 'string') {
    return err;
  }

  if (typeof err === 'number' || typeof err === 'boolean') {
    return String(err);
  }

  if (err instanceof Error) {
    return err.message || err.name || 'Unknown Error';
  }

  if (typeof err !== 'object') {
    return 'Unknown Error';
  }

  const e = err as Record<string, any>;

  if (e['error']) {
    // Angular sets statusText 'Unknown Error' when it fails to JSON.parse the response body;
    // in that case err.error is { error: SyntaxError, text: <raw body> }, not the API's JSON.
    if (typeof e['error']?.['text'] === 'string') {
      return `Non-JSON response: ${e['error']['text']}`;
    }

    const inner = getErrorMessage(e['error']);
    // surface ASP.NET Core ModelState validation details (e.error.errors: { field: string[] })
    const validationErrors = e['error']?.['errors'];
    if (validationErrors && typeof validationErrors === 'object') {
      const details = Object.entries(validationErrors)
        .map(([field, messages]) => `${field}: ${(messages as string[]).join(', ')}`)
        .join('; ');
      return details ? `${inner} (${details})` : inner;
    }
    return inner;
  }

  return e['errorMessage'] || e['title'] || e['message'] || e['statusText'] || 'Unknown Error';
}

function isHttpErrorResponse(err: unknown): err is HttpErrorResponse {
  return err instanceof HttpErrorResponse;
}
