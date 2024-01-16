import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TalukaRoutingModule } from './taluka-routing.module';
import { TalukaComponent } from './taluka.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/common/shared/shared.module';


@NgModule({
  declarations: [
    TalukaComponent
  ],
  imports: [
    CommonModule,
    TalukaRoutingModule,
    SharedModule,

    ReactiveFormsModule,
    FormsModule
  ]
})
export class TalukaModule { }
