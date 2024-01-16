import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ImgProcessComponent } from './img-process.component';

const routes: Routes = [{
  path: '',
  component: ImgProcessComponent,
  data: { title: 'Photo Processing', breadcrumb: 'Photo Processing' }
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ImgProcessRoutingModule { }
