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
  private apiUrl = environment.MasterApi + `api/`;
  constructor(
    private http: HttpClient
  ) {

  }


  /**********************************************/
  /***************** Taluka *******************/
  /**********************************************/
  getTaluka(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}taluka/`);
  }
  getTalukaByDistrict(districtId: string): Observable<any[]> {
    const requestData = { districtId };
    return this.http.post<any[]>(this.apiUrl + `district/taluka`, requestData);
  }
  getVillageByTaluka(district: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}taluka/` + district + `/village`);
  }
  getTalukaById(id: any): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}taluka/${id}`);
  }
  deleteTaluka(id: string): Observable<any> {
    const url = `${this.apiUrl}taluka/${id}`;
    return this.http.delete<any>(url);
  }
  addTaluka(newTaluka: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}taluka/`, newTaluka);
  }
  updateTaluka(talukaId: string | number, talukaData: any): Observable<any> {
    const url = `${this.apiUrl}taluka/${talukaId}`;
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
    const requestData = { districtId };
    return this.http.post<any[]>(`${this.apiUrl}district/deleted-taluka/length`, requestData);
  }
  getDeletedTaluka(districtId: number): Observable<any> {
    const requestData = { districtId };
    return this.http.post<any[]>(this.apiUrl + `district/deleted-taluka`, requestData);
  }
  toggleTalukaActive(talukaId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}toggle-taluka/${talukaId}`, {});
  }
}
