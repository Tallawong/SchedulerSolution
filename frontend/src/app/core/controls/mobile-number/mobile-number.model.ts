import { required, SchemaPathTree } from '@angular/forms/signals';

export interface MobileNumber {
  phoneNumber: string;
}

export function buildMobileNumberSection(a: SchemaPathTree<MobileNumber>) {
  required(a.phoneNumber, { message: 'Phone number is required' });
}
