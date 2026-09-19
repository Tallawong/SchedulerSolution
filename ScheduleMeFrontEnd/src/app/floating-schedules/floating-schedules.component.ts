import { Component, OnInit } from '@angular/core';
import * as signalR from '@microsoft/signalr';
//import { first } from 'rxjs';
import { environment } from 'src/environments/environment';
import { SchedulePoolElement } from '../entities/schedulepoolelement';
import { AccountService, AlertService } from '../services';
import { first } from 'rxjs/operators';

@Component({
  standalone: false,
  selector: 'app-floating-schedules',
  templateUrl: './floating-schedules.component.html',
  styleUrls: ['./floating-schedules.component.less'],
})
export class FloatingSchedulesComponent implements OnInit {
  isLoaded: boolean = false;
  poolElements: SchedulePoolElement[] = [];
  isLoggedAsAdmin: boolean = false;
  connection: signalR.HubConnection;

  constructor(
    private accountService: AccountService,
    private alertService: AlertService,
  ) {
    this.isLoggedAsAdmin = this.accountService.isAdmin();

    this.connection = new signalR.HubConnectionBuilder()
      .configureLogging(signalR.LogLevel.Information)
      .withUrl(environment.baseUrl + '/update')
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
      this.updateSchedulesFromServer();
    });
  }

  ngOnInit(): void {
    this.updateSchedulesFromServer();
  }

  private updateSchedulesFromServer() {
    this.accountService
      .GetAllAvailablePoolElements()
      .pipe(first())
      .subscribe({
        next: (pollElements) => {
          this.poolElements = pollElements.schedulePoolElements;

          this.isLoaded = true;
        },
        error: (error) => {
          this.alertService.error(error);
        },
      });
  }
  ngOnDestroy() {
    console.log('Called');
    this.connection.stop();
  }
  onDeletePoolElement(event: any, scheduleId: string, email: string, userFunction: string) {
    const poolElement = this.getPoolElementById(scheduleId);
    if (poolElement == null) return; // Nothing to delete, should never happen
    poolElement.deleting = true;
    this.accountService
      .deletePoolElement(scheduleId, email, userFunction)
      .pipe(first())
      .subscribe({
        next: () => {
          this.accountService
            .GetAllAvailablePoolElements()
            .pipe(first())
            .subscribe({
              next: (pollElements) => {
                this.poolElements = pollElements.schedulePoolElements;

                this.isLoaded = true;
                poolElement.deleting = false;
              },
              error: (error) => {
                this.alertService.error(error);
                poolElement.deleting = false;
              },
            });
        },
        error: (error) => {
          this.alertService.error(error);
        },
      });
  }
  getPoolElementById(poolId: string): SchedulePoolElement | null {
    for (let index = 0; index < this.poolElements.length; index++) {
      const element = this.poolElements[index];
      if (element.id === poolId) {
        return element;
      }
    }
    return null;
  }
}
