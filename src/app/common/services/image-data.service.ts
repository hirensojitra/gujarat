import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ImageDataService {
  private apiUrl = 'https://api.imgbb.com/1/upload';
  private apiKey = '7271ebac17911e06d3b28f77e14f1c23';
  constructor(private http: HttpClient) { }
  uploadImage(image: File) {
    const formData = new FormData();
    formData.append('key', this.apiKey);
    formData.append('image', image);
    return this.http.post<any>(this.apiUrl, formData);
  }
  getUploadedImages() {
    const url = 'https://api.imgbb.com/1/images?key=' + this.apiKey;
    return this.http.get<any>(url);
  }
}
