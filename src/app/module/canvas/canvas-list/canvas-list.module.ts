import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CanvasListRoutingModule } from './canvas-list-routing.module';
import { CanvasListComponent } from './canvas-list.component';


@NgModule({
  declarations: [
    CanvasListComponent
  ],
  imports: [
    CommonModule,
    CanvasListRoutingModule
  ]
})
export class CanvasListModule { }
