import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { CanvasEditorRoutingModule } from './canvas-editor-routing.module';
import { CanvasEditorComponent } from './canvas-editor.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/common/shared/shared.module';


@NgModule({
  declarations: [
    CanvasEditorComponent
  ],
  imports: [
    CommonModule,
    CanvasEditorRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    SharedModule
  ]
})
export class CanvasEditorModule { }
