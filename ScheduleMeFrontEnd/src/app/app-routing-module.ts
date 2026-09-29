import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './core/controls/home/home.component';
import { AuthGuard } from './core/helpers/auth.guard';
import { Role } from './entities/role';
import { FloatingSchedulesComponent } from './floating-schedules/floating-schedules.component';

// const accountModule = () => import('./account/account.module').then((x) => x.AccountModule);
const adminModule = () => import('./admin/admin.module').then((x) => x.AdminModule);
const profileModule = () => import('./profile/profile.module').then((x) => x.ProfileModule);
// const scheduleModule = () => import('./schedule/schedule.module').then((x) => x.ScheduleModule);

export const routes: Routes = [
  //{ path: '', redirectTo: 'login', pathMatch: 'full' },

  // Referencing the account feature router:
  {
    path: 'account',
    loadChildren: () => import('./account.controls/account.routes').then((m) => m.ACCOUNT_ROUTES),
  },
  // { path: 'account', loadChildren: accountModule },
  { path: '', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'profile', loadChildren: profileModule, canActivate: [AuthGuard] },
  {
    path: 'admin',
    loadChildren: adminModule,
    canActivate: [AuthGuard],
    data: { roles: [Role.Admin] },
  },
  { path: 'floating', component: FloatingSchedulesComponent },

  // otherwise redirect to home
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { enableTracing: true })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
