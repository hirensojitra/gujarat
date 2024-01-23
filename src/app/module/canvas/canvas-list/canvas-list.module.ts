import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CanvasListRoutingModule } from './canvas-list-routing.module';
import { CanvasListComponent } from './canvas-list.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/common/shared/shared.module';


@NgModule({
  declarations: [
    CanvasListComponent
  ],
  imports: [
    CommonModule,
    CanvasListRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    SharedModule
  ]
})
export class CanvasListModule { }
