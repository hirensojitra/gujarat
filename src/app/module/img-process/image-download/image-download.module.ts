import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ImageDownloadRoutingModule } from './image-download-routing.module';
import { ImageDownloadComponent } from './image-download.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    ImageDownloadComponent
  ],
  imports: [
    CommonModule,
    ImageDownloadRoutingModule,
    ReactiveFormsModule,
    FormsModule
  ]
})
export class ImageDownloadModule { }
