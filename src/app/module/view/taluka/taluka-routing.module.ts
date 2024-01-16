import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TalukaComponent } from './taluka.component';
const routes: Routes = [{
  path: '',
  component: TalukaComponent,
  data: { title: 'Taluka', breadcrumb:'Taluka' }
}];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TalukaRoutingModule { }
