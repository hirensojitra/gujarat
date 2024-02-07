import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ImageGenerateRoutingModule } from './image-generate-routing.module';
import { ImageGenerateComponent } from './image-generate.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/common/shared/shared.module';


@NgModule({
  declarations: [
    ImageGenerateComponent
  ],
  imports: [
    CommonModule,
    ImageGenerateRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ]
})
export class ImageGenerateModule { }
