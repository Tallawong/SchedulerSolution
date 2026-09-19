import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Constants } from 'src/app/core/helpers/constants';

import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { MaterialModule } from 'src/app/material/material.module';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideLuxonDateAdapter } from '@angular/material-luxon-adapter';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';
import { AddEditComponent } from './add-edit.component';
import { AddEditRoutingModule } from './add.edit-routing.module';
import { USERS_SERVICE_CONFIG_TOKEN, USERS_SERVICE_TOKEN } from 'src/app/services/test/test.tokens';
import { TestService } from 'src/app/services/test/test.service';

const CUSTOM_LUXON_FORMATS = {
  parse: {
    dateInput: Constants.dateFormat,
  },
  display: {
    dateInput: Constants.dateFormat,
    monthYearLabel: 'MMM yyyy',
    dateA11yLabel: 'DDD',
    monthYearA11yLabel: 'MMMM yyyy',
  },
};

@NgModule({
  declarations: [AddEditComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    MaterialModule,
    MatCardModule,
    MatInputModule,
    MatTableModule,
    MatDatepickerModule,
    MatFormFieldModule,
    RouterModule,
    AddEditRoutingModule,
  ],
  exports: [
    /* CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    MatCardModule,
    MatInputModule,
    MatTableModule,
    MatDatepickerModule,
    MatFormFieldModule,
    RouterModule */
  ],
  providers: [
    provideLuxonDateAdapter(CUSTOM_LUXON_FORMATS),
    // TODO JD TEST
    { provide: USERS_SERVICE_TOKEN, useClass: TestService },
    {
      provide: USERS_SERVICE_CONFIG_TOKEN,
      useValue: { apiUrl: 'http://localhost:3004/users' },
    },
    // TODO JD TEST END
  ],
})
export class AddEditModule {}
