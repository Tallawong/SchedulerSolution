import { Directive } from '@angular/core';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { Constants } from 'src/app/core/helpers/constants';
import { environment } from 'src/environments/environment';

export const FORMAT = {
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

@Directive({
  standalone: false,
  selector: '[appCustomDateFormat]',
  providers: [{ provide: MAT_DATE_FORMATS, useValue: FORMAT }],
})
export class CustomDateFormatDirective {
  constructor() {}
}
