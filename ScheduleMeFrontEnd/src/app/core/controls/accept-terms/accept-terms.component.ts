import { Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { form, FormField } from '@angular/forms/signals';
import { AcceptTerms, buildAcceptTermsSection } from './accept-terms.model';

@Component({
  selector: 'app-accept-terms',
  standalone: true,
  imports: [FormsModule, FormField],
  templateUrl: './accept-terms.component.html',
  styleUrl: './accept-terms.component.css',
})
export class AcceptTermsComponent {
  loading: boolean = false;

  readonly model = model<AcceptTerms>({ acceptTerms: false });

  readonly form = form(this.model, (d) => {
    buildAcceptTermsSection(d);
  });
}
