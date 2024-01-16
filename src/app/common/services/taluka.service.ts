import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';
import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { Taluka } from '../interfaces/commonInterfaces';

@Injectable({
  providedIn: 'root',
})
export class TalukaService {
  private apiUrl = environment.MasterApi+'/taluka';
  constructor(
    private http: HttpClient
  ) {

  }


  /**********************************************/
  /***************** Taluka *******************/
  /**********************************************/
  getTaluka(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}`);
  }
  getTalukaByDistrict(districtId: string): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl + `/district/${districtId}`);
  }
  getTalukaById(id: any): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }
  deleteTaluka(id: string): Observable<any> {
    const url = `${this.apiUrl}/delete/${id}`;
    return this.http.put<any>(url,{});
  }
  addTaluka(newTaluka: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}`, newTaluka);
  }
  updateTaluka(talukaId: string | number, talukaData: any): Observable<any> {
    const url = `${this.apiUrl}/${talukaId}`;
    return this.http.put(url, talukaData);
  }
  checkTalukaNameAvailability(name: string): Observable<{ isTaken: boolean }> {
    return this.http.post<{ isTaken: boolean }>(`${this.apiUrl}taluka-name/`, { name });
  }
  checkTalukaNameAvailabilityValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      const name = control.value;
      return this.checkTalukaNameAvailability(name).pipe(
        map((response) => (response.isTaken ? { talukaNameTaken: true } : null)),
        catchError(() => of(null))
      );
    };
  }
  checkTalukaIdAvailability(id: string): Observable<{ isTaken: boolean }> {
    return this.http.post<{ isTaken: boolean }>(`${this.apiUrl}taluka-id/`, { id });
  }
  checkTalukaIdAvailabilityValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      const id = control.value;
      return this.checkTalukaIdAvailability(id).pipe(
        map((response) => (response.isTaken ? { talukaIdTaken: true } : null)),
        catchError(() => of(null))
      );
    };
  }
  getDeletedTalukaLength(districtId: number): Observable<any> {
    return this.http.get<any[]>(`${this.apiUrl}/deleted/${districtId}`);
  }
  getDeletedTaluka(districtId: number): Observable<any> {
    return this.http.get<any[]>(this.apiUrl + `/deleted-by-district/${districtId}`);
  }
  toggleTalukaActive(talukaId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/restore/${talukaId}`, {});
  }
}
