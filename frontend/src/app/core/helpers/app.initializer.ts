import { AccountService } from '../../services/account/account.service';
import { Account } from '../../entities/account';

export function initializeApp(accountService: AccountService) {
  return async () => {
    try {
      await new Promise<void>((resolve) => {
        // attempt to refresh token on app start up to auto authenticate
        accountService
          .refreshToken()
          .subscribe({
            next: (value: Account) => {
              console.log(
                'initializeApp successful: ' + value.firstName,
                value.lastName,
                value.email,
              );
            },
            error: (error: unknown) => {
              console.warn('Error in initializeApp', error);
            },
          })
          .add(resolve);
      });
      console.log('initializeApp completed');
    } catch (error) {
      console.warn('Error in initializeApp', error);
    }
  };
}
