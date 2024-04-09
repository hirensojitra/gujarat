import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CanvasGeneratorComponent } from './canvas-generator.component';

const routes: Routes = [{
  path: '',
  component: CanvasGeneratorComponent,
  data: {
    title: 'Canvas Generator', breadcrumb: 'Canvas Generator', layout: 'dense-layout'
  },
  children: [
    { path: '', pathMatch: 'full', redirectTo: 'list' },
    { path: 'list', loadChildren: () => import('./image-list/image-list.module').then(m => m.ImageListModule) },
    { path: 'view', loadChildren: () => import('./image-view/image-view.module').then(m => m.ImageViewModule) },
    { path: 'generate', loadChildren: () => import('./image-generate/image-generate.module').then(m => m.ImageGenerateModule) },
    { path: 'deleted', loadChildren: () => import('./image-deleted/image-deleted.module').then(m => m.ImageDeletedModule) }
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CanvasGeneratorRoutingModule { }
