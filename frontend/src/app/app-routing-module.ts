import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './core/controls/home/home.component';
import { AuthGuard } from './core/helpers/auth.guard';
import { FloatingSchedulesComponent } from './floating-schedules/floating-schedules.component';

const profileModule = () => import('./profile/profile.module').then((x) => x.ProfileModule);
const accountsModule = () => import('./admin/accounts/accounts.module').then((x) => x.AccountsModule);

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
    path: 'accounts', loadChildren: accountsModule
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
