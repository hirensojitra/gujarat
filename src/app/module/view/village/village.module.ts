import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VillageRoutingModule } from './village-routing.module';
import { VillageComponent } from './village.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/common/shared/shared.module';


@NgModule({
  declarations: [
    VillageComponent
  ],
  imports: [
    CommonModule,
    VillageRoutingModule,
    SharedModule,

    ReactiveFormsModule,
    FormsModule
  ]
})
export class VillageModule { }
