import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { TimeHandler } from '../core/helpers/time.handler';
import { MatDatepicker } from '@angular/material/datepicker';
import { Constants } from '../core/helpers/constants';
import { DateTime } from 'luxon';
import { toDateTime } from '../core/helpers/date-time';

@Component({
  standalone: false,
  selector: 'app-dob',
  templateUrl: './dob.component.html',
  styleUrls: ['./dob.component.less'],
})
export class DOBComponent implements OnInit {
  @ViewChild(MatDatepicker) datepicker!: MatDatepicker<DateTime>;

  DATE_FORMAT = Constants.dateFormat;
  form!: FormGroup;

  constructor(private formBuilder: FormBuilder) {}
  ngOnInit(): void {
    this.form = this.formBuilder.group({
      dob: ['', [Validators.required, TimeHandler.dateValidator]],
    });
  }
  // convenience getter for easy access to form fields
  get f() {
    return this.form.controls;
  }

  setDOB(date: Date) {
    this.form.patchValue({ dob: toDateTime(date) });
  }
  getDOB(): Date {
    return toDateTime(this.f['dob'].value).toJSDate();
  }
}
