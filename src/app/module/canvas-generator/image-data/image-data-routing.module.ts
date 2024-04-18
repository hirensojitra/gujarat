import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ImageDataComponent } from './image-data.component';
import { AuthGuard } from 'src/app/common/services/auth.guard';

const routes: Routes = [{
  path: '',
  canActivate: [AuthGuard],
  component: ImageDataComponent,
  data: { title: 'Uploaded Images', breadcrumb: 'Deleted Images' }
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ImageDataRoutingModule { }
