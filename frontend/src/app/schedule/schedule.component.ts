import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ThemePalette } from '@angular/material/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortable, Sort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import * as signalR from '@microsoft/signalr';
import { toDateTime } from '../core/helpers/date-time';
import { first } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Account, Role } from '../entities';
import { Schedule } from '../entities/schedule';
import { SchedulePoolElement } from '../entities/schedulepoolelement';
import { Task } from '../entities/task';
import { AccountService, AlertService } from '../services';
import { Constants } from '../core/helpers/constants';
import { AgentTaskConfig } from '../entities/agenttaskconfig';
import { TimeHandler } from '../core/helpers/time.handler';

const COLUMNS_SCHEMA = [
  {
    key: 'Date',
    type: 'text',
    label: 'DateTime',
  },
  {
    key: 'userFunction',
    type: 'text',
    label: 'Duty',
  },
  {
    key: 'scheduleGroup',
    type: 'text',
    label: 'Group',
  },
  {
    key: 'action',
    type: 'button',
    label: 'Action',
  },
];

const VALID_TO_SERVICE_TIMEOUT = 1000 * 60 * 60 * 24; // 1 DAY

@Component({
  standalone: false,
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.less'],
})
export class ScheduleComponent implements OnInit, AfterViewInit {
  @ViewChild('paginator') paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<Schedule>;

  readonly CLEANER_STR = Constants.CLEANER_STR;
  // dateFormat = `${environment.dateTimeFormat}`;
  // dateTimeFormat = `${environment.dateTimeFormat}`;

  form!: FormGroup;
  id: string;

  schedules: Schedule[] = [];
  userFunctionIndexer: number = 0;
  functions: AgentTaskConfig[] = [];
  submitted = false;
  accountService: AccountService;
  account!: Account;
  isLoaded: boolean = false;
  addingSchedule: boolean = false;
  userFunctions: Task[] = [];
  isAdding: boolean = false;

  isLoggedAsAdmin: boolean = false;

  date: string = new Date().toISOString().slice(0, 16);

  poolElements: SchedulePoolElement[] = [];
  isAddScheduleMode: boolean = false;

  dataSource: MatTableDataSource<Schedule>;
  displayedColumns: string[] = COLUMNS_SCHEMA.map((col) => col.key);
  columnsSchema = COLUMNS_SCHEMA;
  public color: ThemePalette = 'primary';
  connection: signalR.HubConnection;

  constructor(
    accountService: AccountService,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private cdr: ChangeDetectorRef,
  ) {
    this.accountService = accountService;
    this.id = this.accountService.accountValue?.id ?? '';

    this.isLoggedAsAdmin = this.accountService.isAdmin();

    this.connection = new signalR.HubConnectionBuilder()
      .configureLogging(signalR.LogLevel.Information)
      .withUrl(environment.apiUrl + '/update')
      .build();

    this.connection
      .start()
      .then(function () {
        console.log('SignalR Connected!');
      })
      .catch(function (err) {
        return console.error(err.toString());
      });

    this.connection.on('SendUpdate', (id: number) => {
      if (id != parseInt(this.id)) {
        console.log('Error');
      }
      /* TODO This used to cause a call to `GetById(int id)` with the id different then this.id 
      Currently I am testing if this is still a problem after fix has been applied*/
      this.updateSchedulesAndPoolFromServer();
    });
    this.dataSource = new MatTableDataSource<Schedule>([]);
  }

  ngAfterViewInit(): void {
    if (!this.id) {
      this.router.navigate(['/account/login']);
      return;
    }
    this.dataSource = new MatTableDataSource<Schedule>([]);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    //   this.dataSource.sortData = (data: Schedule [], sort: MatSort) => {
    //     const factor =
    //      sort.direction == "asc" ? 1 : sort.direction == "desc" ? -1 : 0;

    //     switch(sort.active)
    //     {
    //         case "date":
    //              //..here your function sort...
    //              //return data.sort((a,b)=>....)
    //              break;
    //     }
    //     return data.sort((a : any,b : any)=>a[sort.active]>b[sort.active] ? factor : -1*factor:0)
    //  }
    //}

    // Get the account for this id
    this.accountService
      .getById(this.id)
      .pipe(first())
      .subscribe({
        next: (account) => {
          this.accountService
            .getAllAgentTaskConfigs()
            .pipe(first())
            .subscribe({
              next: (value: AgentTaskConfig[]) => {
                this.functions = value;

                this.initSchedules(account);

                // Initial sorting by date
                this.sort.sort({ id: 'date', start: 'asc' } as MatSortable);

                this.isLoaded = true;

                this.userFunctions = account.userFunctions.slice();

                this.account = account;

                this.userFunctionIndexer =
                  account.userFunctions.length > 0
                    ? parseInt(account.userFunctions[account.userFunctions.length - 1].id)
                    : 0;

                this.accountService
                  .getAvailablePoolElementsForAccount(account.id)
                  .pipe(first())
                  .subscribe({
                    next: (pollElements) => {
                      this.poolElements = pollElements.schedulePoolElements;
                      if (this.poolElements.length != 0) {
                        this.f['availableSchedule4Function'].setValue(
                          this.getConcatPoolElement(this.poolElements[0]),
                        );
                      }
                    },
                    error: (error) => {
                      this.alertService.error(error);
                    },
                  });
              },
              error: (error: unknown) => {
                this.alertService.error(error);
              },
            });
        },
        error: (error: unknown) => {
          this.alertService.error(error);
        },
      });
  }

  ngOnInit(): void {
    this.isAddScheduleMode = this.isLoggedAsAdmin; // If not admin then we are adding available dates

    this.form = this.formBuilder.group({
      availableSchedule4Function: [''],
      allDates: [false, ''],
    });
  }
  sortData(sort: Sort) {
    TimeHandler.sortData(this.schedules, sort);
    this.dataSource.data = this.schedules;
  }

  private getConcatPoolElement(poolElement: SchedulePoolElement): string {
    if (this.poolElements[0].userFunction == this.CLEANER_STR) {
      return poolElement.date + '/' + poolElement.userFunction + '/' + poolElement.scheduleGroup;
    } else {
      return poolElement.date + '/' + poolElement.userFunction;
    }
  }

  ngOnDestroy() {
    console.log('Called');
    this.connection.stop();
  }
  onCheckboxChange() {
    this.updateSchedulesAndPoolFromServer();
  }

  functionValidator(control: FormControl): { [s: string]: boolean } | null {
    if (control.value === '') {
      return { invalidFunction: true };
    }
    return null;
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.form.controls;
  }

  onAddAvailableSchedule() {
    this.submitted = true;
    this.addingSchedule = true;

    // reset alerts on submit
    this.alertService.clear();

    /* Test
    var aDateValid = this.form.controls['availableSchedule4Function'].valid;
    */

    // stop here if form is invalid
    if (this.form.invalid) {
      return;
    }

    const schedule = this.createScheduleFromAvailableDateString('availableSchedule4Function');
    if (schedule == null) {
      return;
    }

    this.isAdding = true;
    this.accountService
      .getScheduleFromPool(this.account.id, schedule)
      .pipe(first())
      .subscribe({
        next: (account) => {
          this.addingSchedule = false;

          console.log(account);
          this.initSchedules(account);

          if (this.poolElements.length != 0) {
            this.f['availableSchedule4Function'].setValue(
              this.getConcatPoolElement(this.poolElements[0]),
            );
          }
          this.updateSchedulesAndPoolFromServer();
        },
        complete: () => {
          this.isAdding = false;
        },
        error: (error) => {
          this.addingSchedule = false;
          this.alertService.error(error);
          this.isAdding = false;
          this.updateSchedulesAndPoolFromServer();
        },
      });
  }
  onDeleteSchedule(schedule2Delete: Schedule) {
    // i is schedule index
    schedule2Delete.deleting = true;
    this.accountService
      .moveSchedule2Pool(this.account.id, schedule2Delete)
      .pipe(first())
      .subscribe({
        next: (account) => {
          this.updateSchedulesAndPoolFromServer();

          this.schedules = account.schedules;
          schedule2Delete.deleting = false;
        },
        error: (error) => {
          this.alertService.error(error);
          this.updateSchedulesAndPoolFromServer();
          schedule2Delete.deleting = false;
        },
      });
  }

  updateSchedulesAndPoolFromServer() {
    if (!this.id) return;
    this.accountService
      .getById(this.id)
      .pipe(first())
      .subscribe({
        next: (account) => {
          this.initSchedules(account);

          this.accountService
            .getAvailablePoolElementsForAccount(account.id)
            .pipe(first())
            .subscribe({
              next: (pollElements) => {
                console.log('Pool Elements:' + pollElements);
                this.poolElements = pollElements.schedulePoolElements;

                if (this.poolElements.length != 0) {
                  this.f['availableSchedule4Function'].setValue(
                    this.getConcatPoolElement(this.poolElements[0]),
                  );
                }
              },
              error: (error) => {
                this.alertService.error(error);
              },
            });
        },
        complete: () => {
          this.sort.sort({ id: 'date', start: 'desc' } as MatSortable);
        },
        error: (error) => {
          this.alertService.error(error);
        },
      });
  }
  initSchedules(account: Account) {
    const schedules: Schedule[] = [];

    const dLocalNow = new Date();
    const localNowMs = dLocalNow.getTime();
    //  Filter out values that are older then now if checkbox this.f['allDates'].value is false
    for (let index = 0; index < account.schedules.length; index++) {
      const schedule = account.schedules[index];
      const scheduleLocalDate = toDateTime(schedule.date, Constants.dateTimeFormat).toJSDate();
      const scheduleLocalDateMs = scheduleLocalDate.getTime();

      // Check the schedule is at least 1 day before now
      if (this.f['allDates'].value || scheduleLocalDateMs - localNowMs > VALID_TO_SERVICE_TIMEOUT) {
        schedules.push(schedule);
      }
    }
    this.schedules = schedules; //.slice();

    this.dataSource.data = this.schedules;
    // this.dataSource.paginator = this.paginator;
    // this.dataSource.sort = this.sort;
  }

  createScheduleFromAvailableDateString(dateFormControlName: string): Schedule | null {
    const dateAndFuncStr = this.form.controls[dateFormControlName].value;
    const array = dateAndFuncStr.split('/');

    const formDateStr = array[0];
    const formFunction = array[1];
    const cleanerGroup = array[2];

    const formMs = Date.parse(array[0]);
    for (let index = 0; index < this.schedules.length; index++) {
      const scheduleMs = new Date(this.schedules[index].date).getTime();
      const scheduleFunction = this.schedules[index].userFunction;
      if (scheduleMs == formMs && scheduleFunction == formFunction) {
        this.alertService.warn('You are already ' + scheduleFunction + ' for that date/time');
        return null;
      }
    }

    const schedule: Schedule = {
      accountId: this.account.id,
      date: formDateStr,
      newDate: formDateStr,
      dob: this.account.dob,
      required: true,
      deleting: false,
      userAvailability: true,
      scheduleGroup: cleanerGroup,
      userFunction: formFunction,
      newUserFunction: formFunction,
      email: this.account.email,
    };
    return schedule;
  }

  isScheduleFromPast(schedule: Schedule) {
    const scheduleLocalDate = toDateTime(schedule.date, Constants.dateTimeFormat).toJSDate();
    const scheduleLocalDateMs = scheduleLocalDate.getTime();

    const localNowMs = Date.now();
    if (scheduleLocalDateMs - localNowMs < VALID_TO_SERVICE_TIMEOUT) {
      return true;
    }
    return false;
  }

  get isAdmin() {
    return this.account?.role == Role.Admin;
  }
}
