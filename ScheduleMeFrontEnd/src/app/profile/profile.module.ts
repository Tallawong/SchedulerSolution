import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { ScheduleModule } from '../schedule/schedule.module';
import { DetailsComponent } from './details.component';
import { LayoutComponent } from './layout.component';
import { ProfileRoutingModule } from './profile-routing.module';
import { UpdateComponent } from './update.component';

import { provideLuxonDateAdapter } from '@angular/material-luxon-adapter';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MaterialModule } from 'src/app/material/material.module';
import { Constants } from '../core/helpers/constants';

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
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ProfileRoutingModule,
    ScheduleModule,

    MaterialModule,
    MatSortModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
  ],
  declarations: [LayoutComponent, DetailsComponent, UpdateComponent],
  providers: [provideLuxonDateAdapter(CUSTOM_LUXON_FORMATS)],
})
export class ProfileModule {}
