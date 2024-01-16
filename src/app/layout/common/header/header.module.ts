import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header.component';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/common/shared/shared.module';
import { AngularBootstrapSidebar } from 'projects/angular-bootstrap-sidebar/src/public-api';



@NgModule({
  declarations: [
    HeaderComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    SharedModule,
    AngularBootstrapSidebar
  ],
  exports:[
    HeaderComponent
  ]
})
export class HeaderModule { }
