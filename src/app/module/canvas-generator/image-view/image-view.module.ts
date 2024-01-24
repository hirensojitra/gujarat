import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ImageViewRoutingModule } from './image-view-routing.module';
import { ImageViewComponent } from './image-view.component';


@NgModule({
  declarations: [
    ImageViewComponent
  ],
  imports: [
    CommonModule,
    ImageViewRoutingModule
  ]
})
export class ImageViewModule { }
