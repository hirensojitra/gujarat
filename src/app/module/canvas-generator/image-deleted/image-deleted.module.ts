import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ImageDeletedRoutingModule } from './image-deleted-routing.module';
import { ImageDeletedComponent } from './image-deleted.component';
import { SharedModule } from 'src/app/common/shared/shared.module';


@NgModule({
  declarations: [
    ImageDeletedComponent
  ],
  imports: [
    CommonModule,
    ImageDeletedRoutingModule,
    SharedModule
  ]
})
export class ImageDeletedModule { }
