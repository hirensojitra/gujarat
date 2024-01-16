import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { LoaderService } from './common/services/loader';

@Injectable()
export class HttpLoaderInterceptor implements HttpInterceptor {
  constructor(private loaderService: LoaderService) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Show the loader before making the HTTP request
    this.loaderService.show(1);
    return next.handle(request).pipe(
      finalize(() => {
        // Hide the loader when the HTTP request is complete
        this.loaderService.hide();
      })
    );
  }
}
