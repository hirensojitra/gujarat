import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MemberService {
  private apiUrl = 'http://localhost:1111/api/members';
  constructor(private http: HttpClient) {}
  getMembersByVillage(village: string): Observable<any> {
    const url = `${this.apiUrl}/${village}`;
    return this.http.get(url);
  }

  isMemberExistsByVillage(village: string): Observable<any> {
    const url = `${this.apiUrl}/exists/${village}`;
    return this.http.get(url);
  }
}
