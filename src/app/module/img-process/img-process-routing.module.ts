import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ImgProcessComponent } from './img-process.component';

const routes: Routes = [{
  path: '',
  component: ImgProcessComponent,
  data: {
    title: 'Canvas Generator', breadcrumb: 'Canvas Generator', layout: 'dense-layout'
  },
  children: [
    { path: '', pathMatch: 'full', redirectTo: 'download' },
    { path: 'download', loadChildren: () => import('./image-download/image-download.module').then(m => m.ImageDownloadModule) }
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ImgProcessRoutingModule { }
