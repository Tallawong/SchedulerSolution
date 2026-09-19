import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { AccountService } from '../services';

@Component({ standalone: false, templateUrl: 'layout.component.html' })
export class LayoutComponent {
  constructor(
    private router: Router,
    private accountService: AccountService,
  ) {
    // redirect to home if already logged in
    if (this.accountService.accountValue) {
      this.router.navigate(['/']);
    }
  }
}
