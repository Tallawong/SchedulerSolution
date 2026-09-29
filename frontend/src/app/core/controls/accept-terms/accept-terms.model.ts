import { SchemaPathTree, validate } from '@angular/forms/signals';

export interface AcceptTerms {
  acceptTerms: boolean;
}

export function buildAcceptTermsSection(a: SchemaPathTree<AcceptTerms>) {
  validate(a.acceptTerms, ({ value }) =>
    value() ? null : { kind: 'required', message: 'You must accept the terms' },
  );
}
