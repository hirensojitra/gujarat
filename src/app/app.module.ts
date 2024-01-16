import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LayoutModule } from './layout/layout.module';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ToastComponent } from './layout/common/toast/toast.component';
import { AuthGuard } from './common/services/auth.guard';
import { HttpLoaderInterceptor } from './http-loader.interceptor';
import { LoaderModule } from './layout/common/loader/loader.module';

@NgModule({
  declarations: [
    AppComponent,
    ToastComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    RouterModule.forRoot([]),
    LayoutModule,
    HttpClientModule,
    LoaderModule
  ],
  providers: [
    AuthGuard,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpLoaderInterceptor,
      multi: true,
    }
  ],
  bootstrap: [AppComponent],
  entryComponents: [
    ToastComponent
  ]
})
export class AppModule { }
