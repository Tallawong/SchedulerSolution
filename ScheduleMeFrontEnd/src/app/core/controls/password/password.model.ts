import { required, SchemaPathTree } from '@angular/forms/signals';

export interface PasswordConfirm {
  password: string;
  confirmPassword: string;
}

export function buildPasswordSection(a: SchemaPathTree<PasswordConfirm>) {
  required(a.password, { message: 'Password is required' });
  required(a.confirmPassword, { message: 'Please confirm your password' });
}
