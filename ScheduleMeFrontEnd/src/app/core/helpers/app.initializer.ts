import { AccountService } from '../../services/account/account.service';

export function initializeApp(accountService: AccountService) {
  return async () => {
    try {
      await new Promise<void>((resolve) => {
        // attempt to refresh token on app start up to auto authenticate
        accountService
          .refreshToken()
          .subscribe({
            next: (value: any) => {
              console.log(
                'initializeApp successful: ' + value.firstName,
                value.lastName,
                value.email,
              );
            },
            error: (error: string) => {
              console.log('Error in initializeApp');
            },
          })
          .add(resolve);
      });
      console.log('initializeApp completed');
    } catch (error) {
      //console.error('Error in initializeApp in catch', error);
    }
  };
}
