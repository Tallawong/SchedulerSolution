import { Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { form, FormField } from '@angular/forms/signals';
import { buildEmailAndDobSection, EmailAndDob } from './email-dob.model';

@Component({
  selector: 'app-email-and-dob',
  standalone: true,
  imports: [FormsModule, FormField],
  templateUrl: './email-dob.component.html',
  styleUrls: ['./email-dob.component.css'],
})
export class EmailAndDobComponent {
  loading: boolean = false;

  readonly model = model<EmailAndDob>({ email: '', dob: '' });

  readonly form = form(this.model, (d) => {
    buildEmailAndDobSection(d);
  });
}
