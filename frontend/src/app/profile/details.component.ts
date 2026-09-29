import { Component } from '@angular/core';

import { AccountService } from '../services';

@Component({ standalone: false, templateUrl: 'details.component.html' })
export class DetailsComponent {
  get account() {
    return this.accountService.accountValue;
  }

  constructor(private accountService: AccountService) {}
}
