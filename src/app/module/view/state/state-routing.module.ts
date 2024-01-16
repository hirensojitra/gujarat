import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StateComponent } from './state.component';

const routes: Routes = [{
  path: '',
  component: StateComponent,
  data: { title: 'State', breadcrumb:'State' }
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StateRoutingModule { }
