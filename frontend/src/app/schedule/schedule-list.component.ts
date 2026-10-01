import { Component, OnInit } from '@angular/core';

import { AccountService } from '../services';

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
