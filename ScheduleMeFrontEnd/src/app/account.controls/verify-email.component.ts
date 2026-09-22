import { Component, OnInit } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';
//import { UserService } from '../services/user.service';
import { VerifyEmailRequest } from '../dto/requests/verify-email-request';
import { AccountModalService } from './account-modal.service';
import { AccountService } from '../services';

@Component({
  standalone: true,
  selector: 'app-verify-email',
  imports: [],
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.css'],
})
export class VerifyEmailComponent implements OnInit {
  loading = true;
  success = false;
  message = '';
  private token = '';
  private readonly redirectDelayMs = 3000;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: AccountService,
    private modalService: AccountModalService,
  ) {}

  ngOnInit(): void {
    // debugger; // Removed leftover debugger statement
    const token = this.route.snapshot.queryParamMap.get('token');
    const dob = this.route.snapshot.queryParamMap.get('DOB');

    if (!token) {
      this.loading = false;
      this.success = false;
      this.message = 'No verification token provided. Please check your email link.';
      return;
    }

    this.token = token;

    const request: VerifyEmailRequest = { token };
    if (dob) {
      request.dob = dob;
    }

  }

  gotoLogin(): void {
    try {
      this.modalService.showLogin();
    } catch {}
    this.router.navigate(['/account/login']);
  }

  // resendVerification(): void {
  //   // Navigate to a resend verification page or show a form
  //   this.router.navigate(['/account/resend-verification']);
  // }
}
