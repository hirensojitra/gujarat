import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';
import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Village } from '../interfaces/commonInterfaces';

@Injectable({
  providedIn: 'root',
})
export class VillageService {

  private apiUrl = 'http://localhost:1111/api/';
  constructor(
    private http: HttpClient
  ) {

  }


  /**********************************************/
  /***************** Village *******************/
  /**********************************************/
  getVillage(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}village/`);
  }
  getVillageById(village: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}village/${village}`);
  }
  getVillageByTaluka(districtId: number | string, talukaId: number | string): Observable<any[]> {
    const body = { districtId, talukaId };
    return this.http.post<any[]>(`${this.apiUrl}district/taluka/village`, body);
  }

  deleteVillage(id: string): Observable<any> {
    const url = `${this.apiUrl}village/${id}`;
    return this.http.delete<any>(url);
  }
  addVillage(villageData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}village/`, villageData);
  }
  updateVillageName(villageId: number | string, villageData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}village/${villageId}`, villageData);
  }
  checkVillageNameAvailability(name: string): Observable<{ isTaken: boolean }> {
    return this.http.post<{ isTaken: boolean }>(`${this.apiUrl}village-name/`, { name });
  }
  checkVillageNameAvailabilityValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      const name = control.value;
      return this.checkVillageNameAvailability(name).pipe(
        map((response) => (response.isTaken ? { villageNameTaken: true } : null)),
        catchError(() => of(null))
      );
    };
  }
  checkVillageIdAvailability(id: string): Observable<{ isTaken: boolean }> {
    return this.http.post<{ isTaken: boolean }>(`${this.apiUrl}village-id/`, { id });
  }
  checkVillageIdAvailabilityValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      const id = control.value;
      return this.checkVillageIdAvailability(id).pipe(
        map((response) => (response.isTaken ? { villageIdTaken: true } : null)),
        catchError(() => of(null))
      );
    };
  }
  getDeletedVillageLength(districtId: string, talukaId: string): Observable<any> {
    const requestData = { districtId, talukaId };
    console.log(requestData)
    return this.http.post<any[]>(`${this.apiUrl}district/taluka/deleted-village/length`, requestData);
  }
  getDeletedVillage(districtId: any,talukaId:any): Observable<any> {
    const requestData = { districtId,talukaId };
    return this.http.post<any[]>(this.apiUrl + `district/taluka/deleted-village`, requestData);
  }
  toggleVillageActive(villageId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}toggle-village/${villageId}`, {});
  }
}
