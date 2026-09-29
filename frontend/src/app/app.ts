import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Account } from './entities/account';
import { Role } from './entities/role';
import { AccountService } from './services/account/account.service';
import { TestService } from './services/test/test.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrls: ['./app.css'],
})
export class App {
  readonly Role = Role;
  // Application initializers finish before Angular creates the root component.
  readonly isLoaded = true;

  private readonly accountService = inject(AccountService);
  private readonly usersService = inject(TestService);
  private readonly currentAccount = toSignal(this.accountService.account, {
    initialValue: this.accountService.accountValue,
  });

  get account(): Account | null {
    return this.currentAccount();
  }

  constructor() {
    // TODO JD TEST
    console.log('usersService', this.usersService);
    this.usersService.getProductInfo();
  }

  logout(): void {
    this.accountService.logout();
  }
}
