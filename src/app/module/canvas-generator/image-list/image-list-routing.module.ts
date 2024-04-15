import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/common/services/auth.guard';
import { ImageListComponent } from './image-list.component';

const routes: Routes = [{
  path: '',
  canActivate: [AuthGuard],
  component: ImageListComponent,
  data: {
    title: 'Image List',
    breadcrumb: 'Image List',
    description: 'Your Page Description'
  }
}]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ImageListRoutingModule { }
