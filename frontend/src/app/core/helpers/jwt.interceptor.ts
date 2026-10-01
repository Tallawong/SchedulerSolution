import { inject } from '@angular/core';

import { AccountService } from '../../services/account/account.service';
import { environment } from '../../../environments/environment';
import { HttpInterceptorFn } from '@angular/common/http';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const accountService = inject(AccountService);
  // add auth header with jwt if account is logged in and request is to the api url
  const account = accountService.accountValue;
  const isLoggedIn = account && account.jwtToken;
  const isApiUrl = req.url.startsWith(environment.apiUrl);
  if (isLoggedIn && isApiUrl) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${account.jwtToken}` },
    });
  }

  return next(req);
};
