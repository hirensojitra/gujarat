import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class JsonbinService {
  private apiUrl = 'https://api.jsonbin.io/b';
  private apiKey = '$2a$10$o9JtKtUtD5VLcDeHan.YD.YZ89mwIv5RCrry.YYRs.4vyPGmj9PBe'; // Replace with your JSONbin.io API key

  private headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'X-Master-Key': this.apiKey,
  });

  constructor(private http: HttpClient) {}

  createBin(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, data, { headers: this.headers });
  }

  getBin(binId: string): Observable<any> {
    const url = `${this.apiUrl}/${binId}`;
    return this.http.get<any>(url, { headers: this.headers });
  }

  updateBin(binId: string, data: any): Observable<any> {
    const url = `${this.apiUrl}/${binId}`;
    return this.http.put<any>(url, data, { headers: this.headers });
  }

  deleteBin(binId: string): Observable<any> {
    const url = `${this.apiUrl}/${binId}`;
    return this.http.delete<any>(url, { headers: this.headers });
  }
}
