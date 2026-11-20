import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ManualRegistrationComponent } from '../manual-registration/manual-registration.component';

const routes: Routes = [
  { path: 'add', component: ManualRegistrationComponent },
  { path: 'edit/:id', component: ManualRegistrationComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddEditRoutingModule {}
