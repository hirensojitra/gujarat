// authentication.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { UserService } from './user.service';
import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { ToastService } from './toast.service';
import { Router } from '@angular/router';


@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private apiUrl = environment.MasterApi + 'api';
  constructor(
    private http: HttpClient,
    private userService: UserService,
    private toastService: ToastService,
    private router: Router
  ) { }
  
  registerUser(userData: any): Observable<boolean> {
    return this.http.post<any>(`${this.apiUrl}/register`, userData).pipe(
      map((response) => {
        // Handle registration response
        if (response.success) {
          const user = response.user; // Assuming the API returns user details
          console.log(user)
          this.userService.setUser(user);
          return true;
        } else {
          return false;
        }
      }),
      catchError((error) => {
        console.error('Registration failed:', error);
        return of(false);
      })
    );
  }
  checkUsernameAvailability(username: string): Observable<{ isTaken: boolean }> {
    return this.http.post<{ isTaken: boolean }>(`${this.apiUrl}/check-username`, { username });
  }
  checkEmailAvailability(email: string): Observable<{ isTaken: boolean }> {
    return this.http.post<{ isTaken: boolean }>(`${this.apiUrl}/check-email`, { email });
  }
  checkUsernameAvailabilityValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      const username = control.value;
      return this.checkUsernameAvailability(username).pipe(
        map((response) => (response.isTaken ? { usernameTaken: true } : null)),
        catchError(() => of(null))
      );
    };
  }

  checkEmailAvailabilityValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      const email = control.value;
      return this.checkEmailAvailability(email).pipe(
        map((response) => (response.isTaken ? { emailTaken: true } : null)),
        catchError(() => of(null))
      );
    };
  }
  login(credentials: { username: string; password: string; }): Observable<boolean> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      map((response) => {
        if (response.success) {
          const user = response.user; // Assuming the API returns user details
          const token = response.token; // Assuming the API returns user details
          this.userService.setUser(user);
          this.storeToken(token)
          return true;
        } else {
          return false;
        }
      }),
      catchError((error) => {
        this.toastService.show(error.error.message, { class: 'bg-danger' });
        return of(false);
      })
    );
  }

  logout(): Observable<boolean> {
    this.removeToken();
    this.userService.clearUser();
    this.router.navigate(['/auth/login']);
    return of(true);
  }

  isAuthenticated(): boolean {
    const result = !!this.getToken();
    console.log('Is Authenticated:', result);
    return result;
  }


  // Example role-based check
  hasRole(roles: string[]): Observable<boolean> {
    return this.userService.getUser().pipe(
      map(value => {
        // Handle the case where user is null
        if (!value) {
          return false;
        }
        return !!value.roles && roles.some(role => value.roles.includes(role));
      })
    );
  }






  private storeToken(token: string): void {
    localStorage.setItem('token', token);
  }

  private getToken(): string | null {
    return localStorage.getItem('token');
  }

  private removeToken(): void {
    // Remove the token from storage
    localStorage.removeItem('token');
  }
}
