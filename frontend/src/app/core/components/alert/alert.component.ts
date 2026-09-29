import { Component, OnInit, OnDestroy, Input, signal } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { Subscription } from 'rxjs';
import { Alert, AlertType } from '../../../entities/alert';
import { AlertService } from '../../../services/alert/alert.service';
import { ReactiveFormsModule } from '@angular/forms';

//import { Alert, AlertType } from '@app/entities';
//import { AlertService } from '@app/_services';

@Component({
  selector: 'alert',
  templateUrl: 'alert.component.html',
  styleUrls: ['./alert.component.less'],
  imports: [ReactiveFormsModule],
})
export class AlertComponent implements OnInit, OnDestroy {
  @Input() id = 'default-alert';
  @Input() fade = true;

  //alerts: Alert[] = [];

  alerts = signal<Alert[]>([]);
  alertSubscription!: Subscription;
  routeSubscription!: Subscription;

  constructor(
    private router: Router,
    private alertService: AlertService,
  ) {}

  ngOnInit() {
    // subscribe to new alert notifications
    this.alertSubscription = this.alertService.onAlert(this.id).subscribe((alert) => {
      // clear alerts when an empty alert is received
      if (!alert.message) {
        // filter out alerts without 'keepAfterRouteChange' flag
        this.alerts.set(this.alerts().filter((x) => x.keepAfterRouteChange));

        // remove 'keepAfterRouteChange' flag on the rest
        this.alerts().forEach((x) => delete x.keepAfterRouteChange);
        return;
      }

      // add alert to array
      //this.alerts().push(alert);

      this.alerts.update((alerts) => [...alerts, alert]);

      // auto close alert if required
      if (alert.autoClose) {
        setTimeout(() => this.removeAlert(alert), 3000);
      }
    });

    // clear alerts on location change
    this.routeSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.alertService.clear(this.id);
      }
    });
  }

  ngOnDestroy() {
    // unsubscribe to avoid memory leaks
    this.alertSubscription.unsubscribe();
    this.routeSubscription.unsubscribe();
  }

  removeAlert(alert: Alert) {
    // check if already removed to prevent error on auto close
    if (!this.alerts().includes(alert)) return;

    if (this.fade) {
      // fade out alert
      alert.fade = true;
      this.alerts.update((alerts) => [...alerts]);

      // remove alert after faded out
      setTimeout(() => {
        this.alerts.set(this.alerts().filter((x) => x !== alert)); // = this.alerts.filter((x) => x !== alert);
      }, 250);
    } else {
      // remove alert
      this.alerts.set(this.alerts().filter((x) => x !== alert)); // = this.alerts().filter((x) => x !== alert);
    }
  }

  cssClasses(alert: Alert) {
    if (!alert) {
      return null;
    }

    const classes = ['alert', 'alert-dismissable'];

    const alertTypeClass = {
      [AlertType.Success]: 'alert alert-success',
      [AlertType.Error]: 'alert alert-danger',
      [AlertType.Info]: 'alert alert-info',
      [AlertType.Warning]: 'alert alert-warning',
    };

    classes.push(alertTypeClass[alert.type]);

    if (alert.fade) {
      classes.push('fade');
    }

    return classes.join(' ');
  }
}
