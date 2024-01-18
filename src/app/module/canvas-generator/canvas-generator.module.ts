import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CanvasGeneratorRoutingModule } from './canvas-generator-routing.module';
import { CanvasGeneratorComponent } from './canvas-generator.component';


@NgModule({
  declarations: [
    CanvasGeneratorComponent
  ],
  imports: [
    CommonModule,
    CanvasGeneratorRoutingModule
  ]
})
export class CanvasGeneratorModule { }
