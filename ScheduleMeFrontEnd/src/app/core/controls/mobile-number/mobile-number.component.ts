import { Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { form, FormField } from '@angular/forms/signals';
import { buildMobileNumberSection, MobileNumber } from './mobile-number.model';

@Component({
  selector: 'app-mobile-number',
  standalone: true,
  imports: [FormsModule, FormField],
  templateUrl: './mobile-number.component.html',
  styleUrl: './mobile-number.component.css',
})
export class MobileNumberComponent {
  loading: boolean = false;
  label: string = '';

  readonly model = model<MobileNumber>({ phoneNumber: '' });

  readonly form = form(this.model, (d) => {
    buildMobileNumberSection(d);
  });
}
