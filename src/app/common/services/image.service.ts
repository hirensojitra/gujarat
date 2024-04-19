import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ImageService {
    private baseUrl = environment.MasterApi + '/images';

    constructor(private http: HttpClient) { }

    uploadImage(imageData: any): Observable<any> {
        return this.http.post<any>(this.baseUrl, imageData);
    }

    getImages(page: number, limit: number): Observable<any> {
        const params = new HttpParams()
            .set('page', page.toString())
            .set('limit', limit.toString());

        const httpOptions = {
            headers: new HttpHeaders({
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }),
            params
        };

        return this.http.get<any>(this.baseUrl, httpOptions);
    }

    deleteImages(ids: string[]): Observable<any> {
        const httpOptions = {
            headers: new HttpHeaders({
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }),
            body: { ids }
        };

        return this.http.delete<any>(`${this.baseUrl}`, httpOptions);
    }
}
