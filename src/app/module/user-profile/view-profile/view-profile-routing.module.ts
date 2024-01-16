import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ViewProfileComponent } from './view-profile.component';

const routes: Routes = [{
    path: '',
    component: ViewProfileComponent,
    data: { title: 'View', breadcrumb: 'View' }
  }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ViewProfileRoutingModule { }
