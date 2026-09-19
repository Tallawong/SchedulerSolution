import {
  AfterViewInit,
  Component,
  inject,
  Input,
  input,
  model,
  OnInit,
  output,
  signal,
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { RegisterRequest } from '../../../dto/requests/register-request';
//import { UserService } from '../../../services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from '../../../services/account/account.service';
import { AccountModalService } from '../../../account.controls/account-modal.service';
//import { AccountModalService } from '../../account/account-modal.service';

@Component({
  selector: 'app-registration-form',
  imports: [FormsModule],
  templateUrl: './registration-form.component.html',
  styleUrl: './registration-form.component.css',
})
/**
 * Reusable modal shell for registration flows.
 * Owns the modal chrome (header, footer, spinner, error alert) and projects
 * form fields into the body. All validation, API calls, and navigation live
 * in the parent component.
 *
 * Selector: app-registration-form
 *
 * Inputs:
 *   title           string   — modal header title
 *   message         string   — subtitle below the title
 *   errorMessage    string   — red alert shown below the form body; clear on each attempt
 *   successMessage  string   — green alert shown below the form body
 *   loading         boolean  — disables the Register button and shows the spinner
 *
 * Outputs:
 *   cancel    boolean  — emitted when Cancel is clicked; parent handles navigation
 *   register  boolean  — emitted when Register is clicked; parent runs validation + API call
 *
 * Content projection slots:
 *   [reg-header]  — extra content appended to the modal header
 *   [reg-body]    — form fields projected into the modal body
 *   .reg-footer   — extra buttons appended to the modal footer
 *
 * Example:
 *   <app-registration-form
 *     [title]="'Create Account'"
 *     [message]="'Fill in the details below'"
 *     [errorMessage]="errorMessage()"
 *     (cancel)="onCancel()"
 *     (register)="onRegister()"
 *   >
 *     <div reg-body>
 *       <!-- form fields bound to parent payload via [(ngModel)] -->
 *     </div>
 *   </app-registration-form>
 */
export class RegistrationFormComponent implements OnInit {
  title = input<string>('');
  message = input<string>('');

  //onCancel = output<boolean> ();

  onSubmit = output<RegisterRequest>();
  loading = input<boolean>(false);

  errorMessage = input<string>('');
  successMessage = input<string>('');
  cancel = output<boolean>();
  register = output<boolean>();

  private route = inject(ActivatedRoute);
  constructor(
    private userService: AccountService,
    private router: Router,
    private modalService: AccountModalService,
  ) {
    console.log('RegisterDialogComponent initialized');
  }

  ngOnInit() {}
  onCancel(): void {
    this.cancel.emit(true);
  }
  onRegister(): void {
    this.register.emit(true);
  }
}
