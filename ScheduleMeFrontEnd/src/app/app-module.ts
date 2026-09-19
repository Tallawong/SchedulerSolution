import { CommonModule } from '@angular/common';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  NgModule,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { HomeComponent } from './core/controls/home/home.component';
import { AlertComponent } from './core/components/alert/alert.component';
import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { MaterialModule } from './material.module';
import { FloatingSchedulesComponent } from './floating-schedules/floating-schedules.component';
import { ApplicationPipesModuleModule } from './application-pipes-module/application-pipes-module.module';
import { OrderByDateOrFunctionPipe } from './application-pipes-module/order-by-date-or-function.pipe';
import { environment } from '../environments/environment';
import { errorInterceptor } from './core/helpers/error.interceptor';
import { jwtInterceptor } from './core/helpers/jwt.interceptor';
import { initializeApp } from './core/helpers/app.initializer';
import { AccountService } from './services/account/account.service';
import { provideApi } from './shared/openapi-api-client/provide-api';
import { DatePickerExampleComponent } from './date-picker-example/date-picker-example.component';

@NgModule({
  exports: [MaterialModule],
  declarations: [App, FloatingSchedulesComponent],
  imports: [
    CommonModule,
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    RouterModule,
    MaterialModule,
    ApplicationPipesModuleModule,
    OrderByDateOrFunctionPipe,
    DatePickerExampleComponent,
    AlertComponent,
    HomeComponent,
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withInterceptors([jwtInterceptor, errorInterceptor])),
    provideApi({ basePath: environment.apiUrl, withCredentials: true }),
    provideAppInitializer(() => initializeApp(inject(AccountService))()),
  ],
  bootstrap: [App],
})
export class AppModule {}
