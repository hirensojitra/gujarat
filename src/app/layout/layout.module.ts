import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutComponent } from './layout.component';
import { EmptyLayoutModule } from './empty-layout/empty-layout.module';
import { DenseLayoutModule } from './dense-layout/dense-layout.module';
import { RouterModule } from '@angular/router';

const layoutModules = [
  // Horizontal navigation
  // Empty 
  EmptyLayoutModule,
  DenseLayoutModule
];
@NgModule({
  declarations: [
    LayoutComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    ...layoutModules
  ],
  exports: [
    LayoutComponent
  ]
})
export class LayoutModule { }
