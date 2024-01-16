import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StateRoutingModule } from './state-routing.module';
import { StateComponent } from './state.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/common/shared/shared.module';


@NgModule({
  declarations: [
    StateComponent
  ],
  imports: [
    CommonModule,
    StateRoutingModule,
    SharedModule,

    ReactiveFormsModule,
    FormsModule
  ]
})
export class StateModule { }
