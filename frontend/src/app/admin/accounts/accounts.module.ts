import { NgModule } from '@angular/core';
import { CommonModule, UpperCasePipe } from '@angular/common';
import { ScheduleDateTimeComponent } from '../../core/components/schedule-date-time/schedule-date-time.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { ApplicationPipesModuleModule } from 'src/app/application-pipes-module/application-pipes-module.module';
import { DOBModule } from 'src/app/dob/dob.module';
import { MaterialModule } from 'src/app/material/material.module';
import { ScheduleModule } from 'src/app/schedule/schedule.module';
import { AccountsRoutingModule } from './accounts-routing.module';
import { CustomDateFormatDirective } from './custom-date-format.directive';
import { FunctionScheduleComponent } from './function-schedule/function-schedule.component';
import { FunctionComponent } from './function.component';
import { GenerateSchedulesComponent } from './generate-schedules/generate-schedules.component';
import { ListComponent } from './list.component';
import { MainSchedulerComponent } from './main-scheduler/main-scheduler.component';
import { ScheduleAllocatorComponent } from './schedule.allocator.component';
import { UploadAccountsComponent } from './upload-accounts/upload-accounts.component';
import { OrderByDateOrFunctionPipe } from 'src/app/application-pipes-module/order-by-date-or-function.pipe';
import { TimeSlotTasksEditorComponent } from './time-slot-tasks-editor/time-slot-tasks-editor.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AgentTaskDefinitionComponent } from './agent-task-definition/agent-task-definition.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TextFieldModule } from '@angular/cdk/text-field';
import { NgbdModalOptionsComponent } from './ngbd-modal-options/ngbd-modal-options.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';

/* This is an alternative way of displaying Date in the format `${environment.dateFormat}` */
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AccountsRoutingModule,
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
    ScheduleDateTimeComponent,
    MatSelectModule,
    DOBModule,
    MatProgressBarModule,
    ApplicationPipesModuleModule,
    OrderByDateOrFunctionPipe,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    TextFieldModule,
    NgbModule,
    NgxMaterialTimepickerModule,
  ],
  declarations: [
    ListComponent,
    FunctionComponent,
    ScheduleAllocatorComponent,
    UploadAccountsComponent,
    CustomDateFormatDirective,
    GenerateSchedulesComponent,
    FunctionScheduleComponent,
    MainSchedulerComponent,
    TimeSlotTasksEditorComponent,
    AgentTaskDefinitionComponent,
    //TimeSlotTasksEditorComponent
    NgbdModalOptionsComponent,
  ],
  providers: [
    {
      provide: UpperCasePipe,
    },
  ],
  exports: [MatPaginatorModule, NgbdModalOptionsComponent],
})
export class AccountsModule {}
