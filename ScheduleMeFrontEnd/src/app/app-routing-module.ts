import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './core/controls/home/home.component';
import { AuthGuard } from './core/helpers/auth.guard';
import { Role } from './entities/role';
import { FloatingSchedulesComponent } from './floating-schedules/floating-schedules.component';

const accountModule = () => import('./account/account.module').then((x) => x.AccountModule);
const adminModule = () => import('./admin/admin.module').then((x) => x.AdminModule);
const profileModule = () => import('./profile/profile.module').then((x) => x.ProfileModule);
const scheduleModule = () => import('./schedule/schedule.module').then((x) => x.ScheduleModule);

const routes: Routes = [
  { path: '', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'account', loadChildren: accountModule },
  { path: 'profile', loadChildren: profileModule, canActivate: [AuthGuard] },
  {
    path: 'admin',
    loadChildren: adminModule,
    canActivate: [AuthGuard],
    data: { roles: [Role.Admin] },
  },
  { path: 'schedule', loadChildren: scheduleModule },
  { path: 'floating', component: FloatingSchedulesComponent },

  // otherwise redirect to home
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
