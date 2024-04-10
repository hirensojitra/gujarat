import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RectResizeRoutingModule } from './rect-resize-routing.module';
import { RectResizeComponent } from './rect-resize.component';


@NgModule({
  declarations: [
    RectResizeComponent
  ],
  imports: [
    CommonModule,
    RectResizeRoutingModule
  ]
})
export class RectResizeModule { }
