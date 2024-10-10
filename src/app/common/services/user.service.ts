import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { User } from '../interfaces/commonInterfaces';
import { Router } from '@angular/router';



@Injectable({
  providedIn: 'root',
})
export class UserService {
  private userSubject: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);
  private apiUrl = environment.MasterApi + '/auth';
  private token: string | null = localStorage.getItem('token'); // Retrieve token from local storage
  constructor(private http: HttpClient, private router: Router) {
    // Initialize the user subject based on stored user details
    const storedUser = localStorage.getItem('user');

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        this.userSubject.next(parsedUser);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        // Handle the error, e.g., clear the stored user details
        localStorage.removeItem('user');
      }
    }
  }

  getUser(): Observable<User | null> {
    return this.userSubject.asObservable();
  }

  setUser(user: User): void {
    this.userSubject.next(user);
    localStorage.setItem('user', JSON.stringify(user));
  }

  clearUser(): void {
    // Clear user details from the service and local storage
    this.userSubject.next(null);
    localStorage.removeItem('user');
  }
  updateUserData(userid: string, updatedData: Partial<User>): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.token}`
    });

    // API endpoint for updating user data
    const fullUrl = `${this.apiUrl}/updateUser/${userid}`;

    return this.http.put(fullUrl, updatedData, { headers });
  }
}
