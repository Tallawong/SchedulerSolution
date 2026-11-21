import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './core/controls/home/home.component';
import { AuthGuard } from './core/helpers/auth.guard';
import { Role } from './entities/role';
import { FloatingSchedulesComponent } from './floating-schedules/floating-schedules.component';

const adminModule = () => import('./admin/admin.module').then((x) => x.AdminModule);
const profileModule = () => import('./profile/profile.module').then((x) => x.ProfileModule);

export const routes: Routes = [
  // empty-path (or default) 
  {
    path: '', component: HomeComponent, canActivate: [AuthGuard]
  },
  // Referencing the account feature router:
  {
    path: 'account',
    loadChildren: () => import('./account.controls/account.routes').then((m) => m.ACCOUNT_ROUTES),
  },
  {
    path: 'profile', loadChildren: profileModule, canActivate: [AuthGuard]
  },
  {
    path: 'admin',
    loadChildren: adminModule,
    canActivate: [AuthGuard],
    data: { roles: [Role.Admin] },
  },
  {
    path: 'floating', component: FloatingSchedulesComponent
  },
  // wildcard route (catch-all route)
  {
    path: '**', redirectTo: ''
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { enableTracing: true })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
