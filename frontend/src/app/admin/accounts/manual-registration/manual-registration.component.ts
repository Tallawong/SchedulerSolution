import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { email, form, FormField, minLength, required, validate } from '@angular/forms/signals';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { first } from 'rxjs/operators';
import { Constants } from '../../../core/helpers/constants';
import { toDateTime } from '../../../core/helpers/date-time';
import { Account, Role } from '../../../entities';
import { AccountService, AlertService } from '../../../services';

@Component({
  selector: 'app-manual-registration',
  standalone: true,
  imports: [FormField, RouterLink],
  templateUrl: './manual-registration.component.html',
  styleUrl: './manual-registration.component.css',
})
export class ManualRegistrationComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly accountService = inject(AccountService);
  private readonly alertService = inject(AlertService);
  private readonly destroyRef = inject(DestroyRef);

  readonly id = this.route.snapshot.params['id'] ?? '';
  readonly isAddMode = !this.id;
  readonly roles = Object.values(Role);
  readonly Role = Role;
  readonly model = signal({
    title: '',
    firstName: '',
    lastName: '',
    email: '',
    dob: '',
    phoneNumber: '',
    role: Role.User,
    password: '',
    confirmPassword: '',
  });
  readonly form = form(this.model, (path) => {
    required(path.title);
    required(path.firstName);
    required(path.lastName);
    required(path.email);
    email(path.email);
    required(path.dob);
    validate(path.dob, ({ value }) =>
      !value() || toDateTime(value()).isValid ? null : { kind: 'invalidDate' },
    );
    required(path.role);
    required(path.password, { when: () => this.isAddMode });
    minLength(path.password, 6);
    validate(path.confirmPassword, ({ value }) =>
      value() === this.model().password ? null : { kind: 'mustMatch' },
    );
  });

  readonly loading = signal(false);
  readonly loadingAccount = signal(false);
  readonly loadFailed = signal(false);
  readonly submitted = signal(false);
  readonly successMessage = signal('');
  readonly errorMessage = signal('');
  readonly account = signal<Account | null>(null);

  ngOnInit(): void {
    if (this.isAddMode) return;

    this.loadingAccount.set(true);
    this.accountService.getById(this.id).pipe(first(), takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (account) => {
        this.account.set(account);
        const dob = toDateTime(account.dob, Constants.dateFormat);
        this.model.update((model) => ({
          ...model,
          title: account.title ?? '',
          firstName: account.firstName ?? '',
          lastName: account.lastName ?? '',
          email: account.email ?? '',
          dob: dob.isValid ? (dob.toISODate() ?? '') : '',
          phoneNumber: account.phoneNumber ?? '',
          role: account.role,
        }));
        this.loadingAccount.set(false);
      },
      error: (error) => {
        this.loadingAccount.set(false);
        this.loadFailed.set(true);
        this.errorMessage.set('Unable to load the account.');
        this.alertService.error(error);
      },
    });
  }

  onSubmit(): void {
    if (this.loading() || this.loadingAccount() || this.loadFailed()) return;

    this.submitted.set(true);
    this.successMessage.set('');
    this.errorMessage.set('');
    this.alertService.clear();
    if (this.form().invalid()) {
      this.form().markAsTouched();
      return;
    }

    const values = this.model();
    const request = {
      ...values,
      dob: toDateTime(values.dob).toFormat(Constants.dateFormat),
    };
    this.loading.set(true);
    const save: Observable<unknown> = this.isAddMode
      ? this.accountService.create(request)
      : this.accountService.update(this.id, request);
    save.pipe(first(), takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.loading.set(false);
        if (this.isAddMode) {
          void this.router.navigate(['/admin/accounts']);
        } else {
          this.alertService.clear();
          this.successMessage.set('Account updated successfully.');
        }
      },
      error: (error) => {
        this.loading.set(false);
        this.errorMessage.set('Unable to save the account.');
        this.alertService.error(error);
      },
    });
  }
}