import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { CanvasEditorRoutingModule } from './canvas-editor-routing.module';
import { CanvasEditorComponent } from './canvas-editor.component';


@NgModule({
  declarations: [
    CanvasEditorComponent
  ],
  imports: [
    CommonModule,
    CanvasEditorRoutingModule,
    DragDropModule
  ]
})
export class CanvasEditorModule { }
