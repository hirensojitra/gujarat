import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ImgProcessRoutingModule } from './img-process-routing.module';
import { ImgProcessComponent } from './img-process.component';


@NgModule({
  declarations: [
    ImgProcessComponent
  ],
  imports: [
    CommonModule,
    ImgProcessRoutingModule
  ]
})
export class ImgProcessModule { }
