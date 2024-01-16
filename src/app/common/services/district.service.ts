// district.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';
import { District, Taluka, Village } from '../interfaces/commonInterfaces';
import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DistrictService {
  private apiUrl = environment.MasterApi + '/district';
  constructor(
    private http: HttpClient
  ) {

  }


  /**********************************************/
  /***************** District *******************/
  /**********************************************/
  getDistrict(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/`);
  }
  getDistrictById(id:string): Observable<District> {
    return this.http.get<District>(`${this.apiUrl}/${id}`);
  }
  
  deleteDistrict(id: string): Observable<any> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<any>(url);
  }
  addDistrict(districtData: { name: string, is_deleted?: boolean }): Observable<{ success: boolean, message?: string, id?: number }> {
    return this.http.post<{ success: boolean, message?: string, id?: number }>(this.apiUrl, districtData);
  }
  updateDistrict(districtId: string, districtData: { name: string, is_deleted?: boolean }): Observable<{ success: boolean, message?: string }> {
    const updateUrl = `${this.apiUrl}/${districtId}`;
    return this.http.put<{ success: boolean, message?: string }>(updateUrl, districtData);
  }
  checkDistrictNameAvailability(name: string): Observable<{ isTaken: boolean }> {
    return this.http.post<{ isTaken: boolean }>(`${this.apiUrl}/district-name`, { name });
  }
  checkDistrictNameAvailabilityValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      const name = control.value;
      return this.checkDistrictNameAvailability(name).pipe(
        map((response) => (response.isTaken ? { districtNameTaken: true } : null)),
        catchError(() => of(null))
      );
    };
  }
  checkDistrictIdAvailability(id: string): Observable<{ isTaken: boolean }> {
    return this.http.post<{ isTaken: boolean }>(`${this.apiUrl}/district-id/`, { id });
  }
  checkDistrictIdAvailabilityValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      const id = control.value;
      return this.checkDistrictIdAvailability(id).pipe(
        map((response) => (response.isTaken ? { districtIdTaken: true } : null)),
        catchError(() => of(null))
      );
    };
  }
  getDeletedDistrictLength(): Observable<{ deletedDistrictCount: number }> {
    return this.http.get<{ deletedDistrictCount: number }>(`${this.apiUrl}/deleted/count`);
  }

  getDeletedDistrict(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/deleted`);
  }

  toggleDistrictActive(id: number): Observable<{ success: boolean, message: string }> {
    return this.http.delete<any>(`${this.apiUrl}/restore/${id}`);
  }

}
