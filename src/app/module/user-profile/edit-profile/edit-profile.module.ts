import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EditProfileRoutingModule } from './edit-profile-routing.module';
import { EditProfileComponent } from './edit-profile.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/common/shared/shared.module';
import { LocalitySelectorComponent } from 'src/app/common/controllers/locality-selector/locality-selector.component';


@NgModule({
  declarations: [
    EditProfileComponent
  ],
  imports: [
    CommonModule,
    EditProfileRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    SharedModule
  ]

})
export class EditProfileModule { }
