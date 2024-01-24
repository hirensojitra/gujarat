import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CanvasGeneratorComponent } from './canvas-generator.component';

const routes: Routes = [{
  path: '',
  component: CanvasGeneratorComponent,
  data: { title: 'Canvas Generator', breadcrumb: 'Canvas Generator' },
  children: [
    { path: '', pathMatch: 'full', redirectTo: 'view' },
    { path: 'view', loadChildren: () => import('./image-view/image-view.module').then(m => m.ImageViewModule) },
    { path: 'generate', loadChildren: () => import('./image-generate/image-generate.module').then(m => m.ImageGenerateModule) }
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CanvasGeneratorRoutingModule { }
