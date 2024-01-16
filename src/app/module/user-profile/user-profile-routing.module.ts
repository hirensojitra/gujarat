import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserProfileComponent } from './user-profile.component';

const routes: Routes = [
  {
    path: '',
    component: UserProfileComponent,
    data: { title: 'User Profile', breadcrumb:'User Profile' },
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'view' },
      { path: 'view', loadChildren: () => import('./view-profile/view-profile.module').then(m => m.ViewProfileModule) },
      { path: 'edit', loadChildren: () => import('./edit-profile/edit-profile.module').then(m => m.EditProfileModule) }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserProfileRoutingModule { }
