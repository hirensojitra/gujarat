import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ImageListRoutingModule } from './image-list-routing.module';
import { ImageListComponent } from './image-list.component';
import { SharedModule } from 'src/app/common/shared/shared.module';


@NgModule({
  declarations: [
    ImageListComponent
  ],
  imports: [
    CommonModule,
    ImageListRoutingModule,
    SharedModule
  ]
})
export class ImageListModule { }
