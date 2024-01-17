import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CanvasComponent } from './canvas.component';

const routes: Routes = [
  {
    path: '',
    component: CanvasComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'list' },
      { path: 'list', loadChildren: () => import('./canvas-list/canvas-list.module').then(m => m.CanvasListModule) },
      { path: 'editor', loadChildren: () => import('./canvas-editor/canvas-editor.module').then(m => m.CanvasEditorModule) }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CanvasRoutingModule { }
