import { Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { form, FormField } from '@angular/forms/signals';
import { buildPasswordSection, PasswordConfirm } from './password.model';

@Component({
  selector: 'app-password',
  standalone: true,
  imports: [FormsModule, FormField],
  templateUrl: './password.component.html',
  styleUrl: './password.component.css',
})
export class PasswordComponent {
  loading: boolean = false;

  readonly model = model<PasswordConfirm>({ password: '', confirmPassword: '' });

  readonly form = form(this.model, (d) => {
    buildPasswordSection(d);
  });
}
