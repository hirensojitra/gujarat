import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/common/services/auth.guard';
import { RoleGuard } from 'src/app/common/services/role.guard';
import { ImageGenerateComponent } from './image-generate.component';

const routes: Routes = [{
  path: '',
  canActivate: [AuthGuard],
  component: ImageGenerateComponent,
  data: { title: 'Image Generate', breadcrumb: 'Image Generate' }
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ImageGenerateRoutingModule { }
