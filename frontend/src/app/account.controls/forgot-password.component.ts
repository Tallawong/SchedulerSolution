import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output, signal } from '@angular/core';
import { A11yModule } from '@angular/cdk/a11y';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AccountService } from '../services';
import { AccountModalService } from './account-modal.service';

@Component({
  standalone: true,
  imports: [FormsModule, A11yModule],
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
  // The native date input stores yyyy-MM-dd in an Angular signal.
  readonly dobModel = signal({ dob: '' });
  loading = false;
  error = '';
  success = '';

  constructor(
    private accountService: AccountService,
    private modalService: AccountModalService,
    private changeDetectorRef: ChangeDetectorRef,
    private router: Router,
  ) {}
  ngOnInit(): void {
    // Initialize component state and guard against stray values
    this.model.dob = '';
    this.dobDate = null;
    this.dobModel.set({ dob: '' });
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
    void this.router.navigate(['/account/login']);
  }

  onSubmit(): void {
    this.error = '';
    if (this.loading || this.success) {
      return;
    }
    if (!this.model.email) {
      this.error = 'Please enter your email.';
      return;
    }
    console.log('[ForgotPassword] onSubmit dobDate:', this.dobDate, 'model.dob:', this.model.dob);
    // DOB is optional but included if provided
    this.loading = true;
    this.setCursor('wait');

    const req = { email: this.model.email, dob: this.model.dob || undefined };
    this.accountService
      .forgotPassword(req)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.resetCursor();
          this.changeDetectorRef.markForCheck();
        }),
      )
      .subscribe({
        next: () => {
          this.success = 'Please check your email for password reset instructions';
          this.changeDetectorRef.markForCheck();
          this.submitted.emit({ email: this.model.email, dob: this.model.dob });
        },
        error: (err) => {
          this.error = err?.error?.message || 'Failed to submit request.';
          this.changeDetectorRef.markForCheck();
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

  onDateInputChange(event: Event): void {
    const input = (event.target as HTMLInputElement).value;
    this.dobModel.set({ dob: input });
    if (input) {
      const [year, month, day] = input.split('-').map(Number);
      const d = new Date(year, month - 1, day);
      if (isNaN(d.getTime()) || d.getFullYear() !== year ||
          d.getMonth() + 1 !== month || d.getDate() !== day) {
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
    this.dobModel.set({ dob: '' });
    this.loading = false;
    this.error = '';
    this.success = '';
    this.resetCursor();
    //this.visible = false;
  }

  private setCursor(cursor: string): void {
    if (typeof document !== 'undefined' && document.body) {
      document.body.style.cursor = cursor;
    }
  }

  private resetCursor(): void {
    if (typeof document !== 'undefined' && document.body) {
      document.body.style.cursor = '';
    }
  }
}
