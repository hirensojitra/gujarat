import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CanvasListComponent } from './canvas-list.component';

const routes: Routes = [{
  path: '',
  component: CanvasListComponent,
  data: { title: 'Image List', breadcrumb:'Image List' }
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CanvasListRoutingModule { }
