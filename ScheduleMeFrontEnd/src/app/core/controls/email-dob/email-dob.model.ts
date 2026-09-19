import { required, SchemaPathTree } from '@angular/forms/signals';

export interface EmailAndDob {
  email: string;
  dob: string;
}

export function buildEmailAndDobSection(a: SchemaPathTree<EmailAndDob>) {
  required(a.email, { message: 'Email is required' });
  required(a.dob, { message: 'Date of birth is required' });
}
