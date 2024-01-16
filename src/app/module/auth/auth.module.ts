import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthRoutingModule } from './auth-routing.module';
import { AuthComponent } from './auth.component';
import { LoginModule } from './login/login.module';
import { RegisterModule } from './register/register.module';
import { ForgetPasswordModule } from './forget-password/forget-password.module';


@NgModule({
  declarations: [
    AuthComponent
  ],
  imports: [
    CommonModule,
    AuthRoutingModule,
    LoginModule,
    RegisterModule,
    ForgetPasswordModule
  ],
  exports: [
    AuthComponent
  ]
})
export class AuthModule { }
