import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ImageDataRoutingModule } from './image-data-routing.module';
import { ImageDataComponent } from './image-data.component';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    ImageDataComponent
  ],
  imports: [
    CommonModule,
    ImageDataRoutingModule,
    FormsModule
  ]
})
export class ImageDataModule { }
