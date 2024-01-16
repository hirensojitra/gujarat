import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { BehaviorSubject, finalize, Observable } from 'rxjs';
import {
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpInterceptor,
} from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class LoaderService implements HttpInterceptor {
    private showLoaderSubject = new BehaviorSubject<boolean>(false);
    private showLoaderTrans = new BehaviorSubject<boolean>(false);
    public showLoader$ = this.showLoaderSubject.asObservable();
    public showLoaderTrans$ = this.showLoaderTrans.asObservable();
    
    constructor(private titleService: Title) {
    }
    show(n: number) {
        this.showLoaderSubject.next(true);
        this.showLoaderTrans.next(n ? true : false);
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
        document.body.style.height = '100%';
    }
    hide() {
        setTimeout(() => {
            this.showLoaderSubject.next(false);
            this.showLoaderTrans.next(false);
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
            document.body.style.height = '';
        }, 500)
    }
    getTitle() {
        return this.titleService.getTitle();
    }
    intercept(
        request: HttpRequest<any>,
        next: HttpHandler
    ): Observable<HttpEvent<any>> {
        this.show(0);
        return next.handle(request).pipe(
            finalize(() => {
                this.hide();
            })
        );
    }
}
