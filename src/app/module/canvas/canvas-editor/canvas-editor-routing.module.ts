import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CanvasEditorComponent } from './canvas-editor.component';

const routes: Routes = [{
  path: '',
  component: CanvasEditorComponent,
  data: { title: 'Image Editor', breadcrumb:'Image Editor' }
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CanvasEditorRoutingModule { }
