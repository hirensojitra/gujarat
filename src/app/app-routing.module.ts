import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './common/services/auth.guard';
import { RoleGuard } from './common/services/role.guard';
import { LayoutComponent } from './layout/layout.component';
const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    component: LayoutComponent,
    data: {
      layout: 'dense-layout'
    },
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'view' },
      { path: 'view', loadChildren: () => import('./module/view/view.module').then(m => m.ViewModule), canActivate: [RoleGuard], data: { role: ['admin'] } },
      { path: 'user-profile', loadChildren: () => import('./module/user-profile/user-profile.module').then(m => m.UserProfileModule) },
      { path: 'canvas', loadChildren: () => import('./module/canvas/canvas.module').then(m => m.CanvasModule) },
      { path: 'img', loadChildren: () => import('./module/img-process/img-process.module').then(m => m.ImgProcessModule) }
    ]
  }, {
    path: '',
    component: LayoutComponent,
    data: {
      layout: 'empty-layout'
    },
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'auth' },
      { path: 'auth', loadChildren: () => import('./module/auth/auth.module').then(m => m.AuthModule) },
      { path: 'images', loadChildren: () => import('./module/canvas-generator/canvas-generator.module').then(m => m.CanvasGeneratorModule) }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
