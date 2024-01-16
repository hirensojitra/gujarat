import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserNewService {
  private apiUrl = 'http://localhost:1111'; // Replace with your actual backend API URL

  constructor(private http: HttpClient) { }

  registerUser(userData: any): Observable<any> {
    console.log(userData);
    return this.http.post(`${this.apiUrl}/register`, userData, { headers: { 'Content-Type': 'application/json' } });

  }
}
