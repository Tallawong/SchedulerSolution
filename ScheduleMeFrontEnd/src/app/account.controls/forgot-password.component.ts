import { Component, EventEmitter, Input, OnInit, OnDestroy, Output } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
//import { UserService } from '../services/user.service';
import { AccountService } from '../services';

@Component({
  standalone: true,
  imports: [FormsModule],
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css'],
})
export class ForgotPasswordComponent implements OnInit {
  @Output() cancelled = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<{ email: string; dob: string }>();

  visible: boolean = true;
  model = { email: '', dob: '' };
  // `dobDate` is the Date selected via material datepicker.
  dobDate: Date | null = null;
  // String value bound to native date input (yyyy-MM-dd)
  dobInput: string = '';
  loading = false;
  error = '';
  success = '';

  constructor(private userService: AccountService) {}
  ngOnInit(): void {
    // Initialize component state and guard against stray values
    this.model.dob = '';
    this.dobDate = null;
    this.dobInput = '';
    console.log('[ForgotPassword] ngOnInit dobDate:', this.dobDate, 'model.dob:', this.model.dob);
  }

  ngOnDestroy(): void {
    // Ensure global cursor is reset if component is destroyed while loading
    this.resetCursor();
  }

  onCancel(): void {
    this.reset();
    this.cancelled.emit();
    this.visible = false;
  }

  onSubmit(): void {
    this.error = '';
    if (!this.model.email) {
      this.error = 'Please enter your email.';
      return;
    }
    console.log('[ForgotPassword] onSubmit dobDate:', this.dobDate, 'model.dob:', this.model.dob);
    // DOB is optional but included if provided
    this.loading = true;
    this.setCursor('wait');

    const req = { email: this.model.email, dob: this.model.dob || undefined };
    this.userService
      .forgotPassword(req)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.resetCursor();
        }),
      )
      .subscribe({
        next: () => {
          this.success = 'Please check your email for password reset instructions';
          this.submitted.emit({ email: this.model.email, dob: this.model.dob });
        },
        error: (err) => {
          this.error = err?.error?.message || 'Failed to submit request.';
        },
      });
  }

  onDateChange(): void {
    console.log('[ForgotPassword] onDateChange dobDate:', this.dobDate);
    if (this.dobDate) {
      // Build ISO yyyy-mm-dd from components to avoid toISOString edge-cases
      const yyyy = String(this.dobDate.getFullYear()).padStart(4, '0');
      const mm = String(this.dobDate.getMonth() + 1).padStart(2, '0');
      const dd = String(this.dobDate.getDate()).padStart(2, '0');
      console.log('[ForgotPassword] dob year:', this.dobDate.getFullYear());
      this.model.dob = `${dd}-${mm}-${yyyy}`;
    } else {
      this.model.dob = '';
    }
  }

  onDateInputChange(): void {
    if (this.dobInput) {
      const d = new Date(this.dobInput);
      if (isNaN(d.getTime())) {
        this.dobDate = null;
        this.model.dob = '';
      } else {
        this.dobDate = d;
        this.onDateChange();
      }
    } else {
      this.dobDate = null;
      this.model.dob = '';
    }
  }

  private reset(): void {
    this.model = { email: '', dob: '' };
    this.dobDate = null;
    this.loading = false;
    this.error = '';
    this.success = '';
    this.resetCursor();
    //this.visible = false;
  }

  private setCursor(cursor: string): void {
    try {
      if (typeof document !== 'undefined' && document.body) {
        document.body.style.cursor = cursor;
      }
    } catch (e) {}
  }

  private resetCursor(): void {
    try {
      if (typeof document !== 'undefined' && document.body) {
        document.body.style.cursor = '';
      }
    } catch (e) {}
  }
}
