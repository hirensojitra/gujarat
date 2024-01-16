import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DenseLayoutComponent } from './dense-layout.component';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/common/shared/shared.module';
import { FormsModule } from '@angular/forms';
import { HeaderModule } from '../common/header/header.module';
import { AngularBootstrapSidebar } from 'projects/angular-bootstrap-sidebar/src/public-api';
@NgModule({
  declarations: [
    DenseLayoutComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    SharedModule,
    AngularBootstrapSidebar,
    FormsModule,
    HeaderModule
  ],
  exports:[
    DenseLayoutComponent
  ]
})
export class DenseLayoutModule { }
