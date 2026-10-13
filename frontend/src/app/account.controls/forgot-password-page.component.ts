import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ForgotPasswordComponent } from './forgot-password.component';

@Component({
  standalone: true,
  imports: [ForgotPasswordComponent],
  selector: 'app-forgot-password-page',
  template: `
    <div
      style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; display: flex; align-items: center; justify-content: center; padding: 20px; overflow-y: auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);"
    >
      <div class="row w-100">
        <div class="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-4 mx-auto">
          <app-forgot-password (cancelled)="onCancelled()"></app-forgot-password>
        </div>
      </div>
    </div>
  `,
})
export class ForgotPasswordPageComponent {
  constructor(private router: Router) {}

  onCancelled() {
    this.router.navigate(['/']);
  }
}
