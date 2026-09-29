import { required, SchemaPathTree } from '@angular/forms/signals';

export interface FirstLast {
  first: string;
  last: string;
}

export function buildAccountSection(a: SchemaPathTree<FirstLast>) {
  required(a.first, { message: 'First name is required' });
  required(a.last, { message: 'Last name is required' });
}
