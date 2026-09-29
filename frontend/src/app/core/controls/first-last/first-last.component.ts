import { first } from 'rxjs/operators';

import { Component, model } from '@angular/core';
import { AbstractControl, FormControl, FormsModule } from '@angular/forms';
import { buildAccountSection, FirstLast } from './first-last.model';
import { FormRoot } from '@angular/forms/signals';
import { form, FormField, PathKind, required, SchemaPath, validate } from '@angular/forms/signals';

// export interface FirstLast {
//   first: string;
//   last: string;
// }

// function firstLastValidatorValidator(
//   first: SchemaPath<string, 1, PathKind.Child>,
//   p0: { message: string },
//   control: FormControl,
// ): { [s: string]: boolean } | null {
//   if (!control.value.match(/^123/)) {
//     return { invalidSku: true };
//   } else {
//     return null;
//   }
// }
function firstLastValidator(control: AbstractControl): { [s: string]: boolean } | null {
  if (!control.value.match(/^123/)) {
    return { invalidSku: true };
  } else {
    return null;
  }
}

@Component({
  selector: 'app-first-last',
  standalone: true,
  imports: [FormsModule, FormField, FormRoot],
  templateUrl: './first-last.component.html',
  styleUrl: './first-last.component.css',
})
export class FirstLastComponent {
  loading: boolean = false;

  readonly model = model<FirstLast>({ first: '', last: '' });

  readonly form = form(this.model, (d) => {
    //buildAccountSection(d);
    required(d.first, { message: 'First name is required' });
    required(d.last, { message: 'Last name is required' });
    validate(d.first, ({ value }) => {
      return value().includes(' ') ? { kind: 'no-spaces', message: 'No spaces allowed' } : null;
    });
    validate(d.last, ({ value }) => {
      return value().includes(' ') ? { kind: 'no-spaces', message: 'No spaces allowed' } : null;
    });
  });
}
