import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainSchedulerComponent } from './main-scheduler.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MaterialModule } from '../../../material.module';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatPaginatorModule } from '@angular/material/paginator';
import { GenerateSchedulesComponent } from '../generate-schedules/generate-schedules.component';
import { AdminModule } from '../../admin.module';
import { AccountsModule } from '../accounts.module';

describe('MainSchedulerComponent', () => {
  let component: MainSchedulerComponent;
  let fixture: ComponentFixture<MainSchedulerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MainSchedulerComponent ],

      imports: [

        //AdminModule,
        MaterialModule,
        MatSortModule,
        MatTableModule,
        MatPaginatorModule,
        // MatButtonModule,
        // MatDatepickerModule,
        // MatNativeDateModule,
        // MatInputModule,
        MatFormFieldModule,

        // MatSelectModule,
        // MatProgressSpinnerModule,
        // MatCheckboxModule,
        // MatCheckboxModule,
        //AccountsModule

        //AccountsModule,


        //GenerateSchedulesComponent,

        //MainSchedulerComponent
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MainSchedulerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
