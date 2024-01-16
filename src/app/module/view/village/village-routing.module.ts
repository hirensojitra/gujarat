import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VillageComponent } from './village.component';
const routes: Routes = [{
  path: '',
  component: VillageComponent,
  data: { title: 'Village', breadcrumb:'Village' }
}];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VillageRoutingModule { }
