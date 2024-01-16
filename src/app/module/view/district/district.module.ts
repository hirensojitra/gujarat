import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DistrictRoutingModule } from './district-routing.module';
import { DistrictComponent } from './district.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/common/shared/shared.module';


@NgModule({
  declarations: [
    DistrictComponent
  ],
  imports: [
    CommonModule,
    DistrictRoutingModule,
    SharedModule,

    ReactiveFormsModule,
    FormsModule
  ]
})
export class DistrictModule { }
