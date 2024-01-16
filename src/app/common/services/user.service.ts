// user.service.ts
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { User } from '../interfaces/commonInterfaces';



@Injectable({
  providedIn: 'root',
})
export class UserService {
  private userSubject: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);
  private apiUrl = environment.MasterApi + 'api';
  private token: string | null = localStorage.getItem('token'); // Retrieve token from local storage
  constructor(private http: HttpClient) {
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
    // Store user details in the service and update the subject
    this.userSubject.next(user);
    // Optionally, store user details in local storage
    localStorage.setItem('user', JSON.stringify(user));
  }

  clearUser(): void {
    // Clear user details from the service and local storage
    this.userSubject.next(null);
    localStorage.removeItem('user');
  }
  updateUserData(user: string, updatedData: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.token}`,
    });
    return this.http.put(`${this.apiUrl}/updateUser/${user}`, updatedData, { headers });
  }
}
