import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ImageDownloadComponent } from './image-download.component';

const routes: Routes = [{
  path: '',
  component: ImageDownloadComponent,
  data: { title: 'Image View', breadcrumb:'Image View' }
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ImageDownloadRoutingModule { }
