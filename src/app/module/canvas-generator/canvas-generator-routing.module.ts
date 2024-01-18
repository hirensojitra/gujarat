import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CanvasGeneratorComponent } from './canvas-generator.component';

const routes: Routes = [{
  path: '',
  component: CanvasGeneratorComponent,
  data: { title: 'Canvas Generator', breadcrumb:'Canvas Generator' }}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CanvasGeneratorRoutingModule { }
