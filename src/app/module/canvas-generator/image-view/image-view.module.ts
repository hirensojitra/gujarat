import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ImageViewRoutingModule } from './image-view-routing.module';
import { ImageViewComponent } from './image-view.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    ImageViewComponent
  ],
  imports: [
    CommonModule,
    ImageViewRoutingModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class ImageViewModule { }
