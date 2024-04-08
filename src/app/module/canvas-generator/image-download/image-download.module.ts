import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ImageDownloadRoutingModule } from './image-download-routing.module';
import { ImageDownloadComponent } from './image-download.component';


@NgModule({
  declarations: [
    ImageDownloadComponent
  ],
  imports: [
    CommonModule,
    ImageDownloadRoutingModule
  ]
})
export class ImageDownloadModule { }
