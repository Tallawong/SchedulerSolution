import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';

import { AccountService } from '../services';
import { Account } from '../entities';

@Component({ standalone: false, templateUrl: 'schedule-list.component.html' })
export class ScheduleListComponent implements OnInit {
  //accounts: any[];
  get account() {
    return this.accountService.accountValue;
  }
  constructor(private accountService: AccountService) {}

  ngOnInit() {
    if (this.account) {
      console.log(this.account.firstName);
    } else {
      console.log('account is NULL');
    }
  }
}
