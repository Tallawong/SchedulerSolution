import { Component, input, model, output } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';
import { form, FormField, required } from '@angular/forms/signals';

export interface HonorificsData {
  salutation: string;
}

@Component({
  standalone: true,
  selector: 'app-honorifics',
  imports: [FormsModule, FormField],
  templateUrl: './honorifics.component.html',
  styleUrl: './honorifics.component.css',
})
export class HonorificsComponent {
  //salutation = model<string>();
  loading: boolean = false;

  model = model<HonorificsData>({
    salutation: '',
  });
  form = form(this.model, (d) => {
    required(d.salutation, { message: 'Salutation is required' });
  });

  // onSalutationChange(value: string): void {
  //   this.salutation.set(value);
  // }
}
