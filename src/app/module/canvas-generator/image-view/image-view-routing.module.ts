import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ImageViewComponent } from './image-view.component';

const routes: Routes = [{
  path: '',
  component: ImageViewComponent,
  data: { title: 'Image View', breadcrumb:'Image View' }
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ImageViewRoutingModule { }
