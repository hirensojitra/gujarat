import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RectResizeComponent } from './rect-resize.component';

const routes: Routes = [{
  path: '',
  component: RectResizeComponent,
  data: { title: 'Rect Resize', breadcrumb:'Rect Resize' }
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RectResizeRoutingModule { }
