import {
  Component,
  EventEmitter,
  Input,
  Output,
  ChangeDetectorRef,
  NgZone,
  OnInit,
  OnDestroy,
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { LoginRequest } from '../dto/requests/login-request';
import { Router } from '@angular/router';
//import { UserService } from '../services/user.service';
import { AccountModalService } from './account-modal.service';
import { Subscription, finalize } from 'rxjs';
import { AccountService } from '../services';

@Component({
  standalone: true,
  imports: [FormsModule],
  selector: 'app-login-prompt',
  templateUrl: './login-prompt.component.html',
  styleUrls: ['./login-prompt.component.css'],
})
export class LoginPromptComponent implements OnInit {
  @Input() visible: boolean = true;
  @Output() cancelled = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<LoginRequest>();
  @Output() register = new EventEmitter<void>();
  @Output() forgotPassword = new EventEmitter<void>();

  errorMessage = '';
  loading: boolean = false;
  // MFA UI state
  showMfa: boolean = false;
  mfaEmail: string = '';
  dobInput: string = '';
  private subs: Subscription[] = [];

  constructor(
    private userService: AccountService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    private modalService: AccountModalService,
  ) {
    console.log('LoginPromptComponent initialized');
  }
  ngOnInit(): void {
    // Initialize the component
    // Reset login form and error state
    this.login = { email: '', password: '', dob: '' };
    this.dobInput = '';
    this.errorMessage = '';
    this.loading = false;

    // Sync visibility with shared modal service
    this.subs.push(
      this.modalService.loginVisible$.subscribe((v) => {
        this.visible = v;
        try {
          this.cdr.detectChanges();
        } catch {}
      }),
    );
  }
  login: LoginRequest = { email: '', password: '', dob: '' };

  onDobInputChange(): void {
    // <input type="date"> yields yyyy-mm-dd; backend expects dd-mm-yyyy
    if (!this.dobInput) {
      this.login.dob = '';
      return;
    }
    const [yyyy, mm, dd] = this.dobInput.split('-');
    this.login.dob = `${dd}-${mm}-${yyyy}`;
  }

  onCancel(): void {
    this.visible = false;
    this.modalService.hideLogin();
    this.loading = false;
    this.cancelled.emit();
    try {
      this.router.navigate(['/']);
    } catch {}
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.loading = true;
    this.submitted.emit(this.login);

    this.userService
      .login(this.login.email, this.login.password, this.login.dob || '')
      .pipe(
        finalize(() => {
          this.loading = false;
          try {
            this.cdr.detectChanges();
          } catch {}
        }),
      )
      .subscribe({
        next: (data: any) => {
          if (data?.mfaRequired === true) {
            this.mfaEmail = this.login.email;
            this.showMfa = true;
            return;
          }

          // Normal login with token
          if (data?.accessToken) {
            console.log('Login successful:', data);
            this.ngZone.run(() => {
              this.modalService.hideLogin();
              try {
                this.cdr.detectChanges();
              } catch {}
              try {
                this.router.navigate(['/profile']);
              } catch {}
            });
            return;
          }

          // Unexpected response
          console.log('Login response (no token, no MFA):', data);
          this.errorMessage = 'Unexpected login response';
        },
        error: (err: any) => {
          console.error('Login failed:', err);
          this.errorMessage =
            err?.error?.error || err?.error?.message || err?.message || 'Login failed';
        },
      });
  }

  onRegister(): void {
    this.register.emit();
    this.router.navigate(['/account/register'], {
      queryParams: {
        title: 'Create an account',
        message: "Join now — it's quick and easy",
      },
    });
  }

  onForgotPassword(): void {
    this.forgotPassword.emit();
    try {
      this.router.navigate(['/account/forgot-password']);
    } catch {}
  }

  // // MFA dialog handlers
  // TODO onMfaVerify(code: string): void {
  //   this.errorMessage = '';
  //   this.loading = true;
  //   this.userService
  //     .verifyMfa(this.mfaEmail, code)
  //     .pipe(
  //       finalize(() => {
  //         this.loading = false;
  //         try {
  //           this.cdr.detectChanges();
  //         } catch {}
  //       }),
  //     )
  //     .subscribe({
  //       next: (token: any) => {
  //         this.showMfa = false;
  //         this.mfaEmail = '';
  //         this.ngZone.run(() => {
  //           try {
  //             this.cdr.detectChanges();
  //           } catch {}
  //           try {
  //             this.modalService.hideLogin();
  //           } catch {}
  //           try {
  //             this.router.navigate(['/profile']);
  //           } catch {}
  //         });
  //       },
  //       error: (err: any) => {
  //         console.error('MFA verification failed', err);
  //         const msg = err?.error?.error || err?.error?.message || err?.message || 'Invalid code';
  //         this.errorMessage = msg;
  //         // If the server indicates the code expired, close the MFA dialog so
  //         // the login error message is visible and user can retry login.
  //         try {
  //           if (/expire/i.test(msg)) {
  //             this.showMfa = false;
  //             this.mfaEmail = '';
  //           }
  //         } catch {}
  //       },
  //     });
  // }

  // onMfaCancelled(): void {
  //   this.showMfa = false;
  //   this.mfaEmail = '';
  //   this.loading = false;
  //   try {
  //     this.cdr.detectChanges();
  //   } catch {}
  // }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }
}
