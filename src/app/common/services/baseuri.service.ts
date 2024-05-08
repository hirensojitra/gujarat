import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class BaseUrlService {

    constructor(@Inject(DOCUMENT) private document: Document) { }

    getBaseUrl(): string {
        let baseUrl = this.document.baseURI;
        if (!baseUrl.startsWith('https://')) {
            // If the base URL doesn't start with 'https://', prepend it
            baseUrl = 'https://' + baseUrl.substring(baseUrl.indexOf('://') + 3);
        }
        return baseUrl;
    }
}
