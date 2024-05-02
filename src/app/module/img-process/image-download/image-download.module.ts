import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ImageDownloadRoutingModule } from './image-download-routing.module';
import { ImageDownloadComponent } from './image-download.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/common/shared/shared.module';


@NgModule({
  declarations: [
    ImageDownloadComponent
  ],
  imports: [
    CommonModule,
    ImageDownloadRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    SharedModule
  ]
})
export class ImageDownloadModule { }
