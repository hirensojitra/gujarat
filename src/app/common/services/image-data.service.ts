import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ImageDataService {
  private readonly apiUrl = 'http://localhost:8888/api';

  constructor(private http: HttpClient) {}

  // Fetch data from the JSON file
  getImageData(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // Update data in the JSON file
  updateImageData(data: any[]): Observable<any> {
    return this.http.put<any>(this.apiUrl+`/update`, data);
  }
}
