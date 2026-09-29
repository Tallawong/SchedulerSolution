import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { AccountService } from '../services';
import {RouterOutlet} from '@angular/router';
@Component(
  {
    standalone: true,
    templateUrl: 'layout.component.html',
    imports: [
    RouterOutlet
  ],

  selector: 'app-login-prompt',
  template: './layout.component.html',
  
  })
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
