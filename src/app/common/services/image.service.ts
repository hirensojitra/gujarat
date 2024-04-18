import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ImageService {
    private baseUrl = environment.MasterApi + '/images';
    constructor(private http: HttpClient) {

    }
    uploadImage(imageData: any): Observable<any> {
        return this.http.post<any>(this.baseUrl, imageData);
    }
    getImages(page: number, limit: number): Observable<any> {
        const params = { page: page.toString(), limit: limit.toString() };
        return this.http.get<any>(this.baseUrl, { params });
    }
    deleteImages(ids: string[]): Observable<any> {
        return this.http.delete<any>(`${this.baseUrl}`, { body: { ids } });
    }
}
