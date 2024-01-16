import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';
import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Village } from '../interfaces/commonInterfaces';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class VillageService {

  private apiUrl = environment.MasterApi+'/village';
  constructor(
    private http: HttpClient
  ) {

  }


  /**********************************************/
  /***************** Village *******************/
  /**********************************************/
  getVillage(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}`);
  }
  getVillageById(village: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${village}`);
  }
  getVillageByTaluka(talukaId: string): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl + `/taluka/${talukaId}`);
  }

  deleteVillage(id: string): Observable<any> {
    const url = `${this.apiUrl}/delete/${id}`;
    return this.http.put<any>(url,{});
  }
  addVillage(villageData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}`, villageData);
  }
  updateVillageName(villageId: number | string, villageData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${villageId}`, villageData);
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
    return this.http.get<any[]>(`${this.apiUrl}/deleted/${talukaId}`);
  }
  getDeletedVillage(talukaId:any): Observable<any> {
    return this.http.get<any[]>(this.apiUrl + `/deleted-by-taluka/${talukaId}`);
  }
  toggleVillageActive(villageId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/restore/${villageId}`, {});
  }
}
